
var visualiser = (function() {

  // DOM Elements
  var sourceDropDown = document.getElementById("source-dropdown"),
      analyzeBtn = document.getElementById("analyze"),
      sourceLogo = document.getElementById("source-logo");

  // Global variables
  var database = this.database = {};
  var topicsCount = this.topicsCount = {};

  // Waterfall function
  function waterfall(arg, tasks, cb) {
    var next = tasks[0];
    var tail = tasks.slice(1);
    if (typeof next !== 'undefined') {
      next(arg, function(err, result) {
        if(err) { return cb(err); }
        waterfall(result, tail, cb);
      });
      return;
    }
    cb(null, arg);
  }

  // Make values of each topic be between 0 and 1.0
  function normalise(topics, cb) {
    var maxValue = 0;
    for(var topic in topics) {
      if(topics[topic] > maxValue) {
        maxValue = topics[topic];
      }
    }
    for(var topic in topics) {
      topics[topic] = topics[topic] / maxValue;
    }
    cb(null, topics);
  }

  //// Event Handlers /////

  // Window load
  window.addEventListener("load", function(){
      waterfall(database, [getSources, buildOptions], function(err, result) {
        console.log(err, result);
      });
  });

  // Dropdown
  sourceDropDown.addEventListener("change", function(){
      deactivateAnalyzeBtn();
      // Marina: waterfall function below needs function between getHeadlines and activayeAnalyze...
      waterfall(sourceDropDown.value, [updateLogo, getHeadlines, activateAnalyzeBtn], function(err, result) {
        console.log(err, result);
      });
  });

  // Analyze
  analyzeBtn.addEventListener("click", function(){
    waterfall(sourceDropDown.value, [getHeadlines, processHeadlines, normalise], function(err, result) {
      if(err) { throw new Error(err); }
      var normalisedTopics = result;
      console.log(normalisedTopics);
    });
    //var topicsCount = processHeadlines(database[sourceDropDown.value]);
    /* Call function to insert infographic */
  });

  //// Async functions ////

  function updateLogo(selectedSource, cb){
    var logoUrl = database[selectedSource]["logo"];
    sourceLogo.src = logoUrl;
    cb(null, selectedSource);
  }

  // function to build options for sourceDropDown select elements
  function buildOptions(database){
    for (var source in database){
      var option = document.createElement("option");
      option.textContent = source;
      option.value = source;
      sourceDropDown.appendChild(option);
    }
  }

  // activate/deactivate analyzeBtn;
  function activateAnalyzeBtn(){
    analyzeBtn.disabled = false;
  }

  function deactivateAnalyzeBtn(){
    analyzeBtn.disabled = true;
  }

  // Add onClick functionality when headlines loaded
  function addToggleToHeadlines() {
    var headlines = document.querySelectorAll('.headline');
    for(var i = 0; i < headlines.length; i++) {
      headlines[i].addEventListener('click', function() {
        var description = this.querySelector('p');
        description.style.display = description.style.display === 'inherit' ? 'none' : 'inherit';
      });
    }
  }

  // 1. getSources called on window load
  function getSources(database, cb){

    var url = "https://newsapi.org/v1/sources?language=en&country=gb" + "&apikey=" + apiKeys.newsApiKey;
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function(){
      var json = JSON.parse(xhr.responseText);
        json.sources.forEach(function(source){
          database[source.name] = {
            name: source.name,
            id: source.id,
            logo: source.urlsToLogos.small
          };
        });
        // 2
        cb(null, database);
    });
    xhr.open('GET', url, true);
    xhr.send();
  }

  // 2. getHeadlines, accepts db object name and retrieves headlines

  function getHeadlines(selectedSource, cb) {
    selectedSource = database[selectedSource];

    var url = "https://newsapi.org/v1/articles?" + "source=" + selectedSource.id + "&apikey=" + apiKeys.newsApiKey;
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function(){
      // This will store all headlines to db
      var json = JSON.parse(xhr.responseText);
      database[selectedSource.name]["headlines"] = [];
      json.articles.forEach(function(article) {
        delete article["author"];
        database[selectedSource.name]["headlines"].push(article);
      });
      cb(null, selectedSource);
    });
    xhr.open('GET', url, true);
    xhr.send();
  }

  function processHeadlines(selectedSource, cb){
    var headlines = selectedSource.headlines;
    var topics = {};
    var functions = headlines.map(function(headline, i) {
      return analyseHeadline.bind(null, i, topics);
    });
    waterfall(headlines, functions, function(err, result) {
      cb(null, topics);
    });
  }

  // Text Razor requests
  function analyseHeadline(i, topics, headlines, cb) {
    var headline = headlines[i];
    var http = new MockXMLHttpRequest();
    var url = 'https://api.textrazor.com/';
    var params = 'text=' + headline.title + '&extractors=topics';
    params = encodeURI(params);

    http.open('POST', url, true);

    http.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
    http.setRequestHeader('X-TextRazor-Key', apiKeys.textRazorKey);

    http.addEventListener('load', function() {
      var result = JSON.parse(http.responseText);
      if(result.response.coarseTopics) {
        updateTopics(result, topics);
      }
      cb(null, headlines);
    });

    http.send(params);
  }

  function updateTopics(result, topics) {
    result.response.coarseTopics.forEach(function(el){
      if(el.score > 0.5) {
        if(topics[el.label]) {
          topics[el.label] += el.score;
        } else {
          topics[el.label] = el.score;
        }
      }
    });
  }

})();
