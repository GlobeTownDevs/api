
var visualiser = (function() {

  // DOM Elements
  var sourceDropDown = document.getElementById("source-dropdown"),
      analyzeBtn = document.getElementById("analyze"),
      sourceLogo = document.getElementById("source-logo");

  // Global variables
  var database = this.database = {};
  var topicsCount = this.topicsCount = {};

  // Waterfall function (no error handling)
  function waterfall(start, tasks) {
    var next = tasks[0];
    var tail = tasks.slice(1);
    if (typeof next !== 'undefined') {
      next(start, function(result) {
        waterfall(result, tail)
      });
      return;
    }
  }

  function normalise(topics) {
    console.log(topics);
    var maxValue = 0;
    console.log(Object.assign({}, topics));
    console.log(Object.keys(topics));
    for(var topic in topics) {
      console.log(topic);
      if(topics[topic] > maxValue) {
        maxValue = topics[topic];
      }
    }
    for(var topic in topics) {
      topics[topic] = topics[topic] / maxValue;
    }
    console.log(topics);
  }

  //// Event Handlers /////

  // Window load
  window.addEventListener("load", function(){
      waterfall(database, [getSources, buildOptions]);
  })

  // Dropdown
  sourceDropDown.addEventListener("change", function(){
      deactivateAnalyzeBtn();
      // Marina: waterfall function below needs function between getHeadlines and activayeAnalyze...
      waterfall(sourceDropDown.value, [updateLogo, getHeadlines, activateAnalyzeBtn]);
  });

  // Analyze
  analyzeBtn.addEventListener("click", function(){
    topicsCount = {};
    waterfall(sourceDropDown.value, [getHeadlines, processHeadlines, normalise]);
    //var topicsCount = processHeadlines(database[sourceDropDown.value]);
    /* Call function to insert infographic */
  });

  //// Async functions ////

  function updateLogo(selectedSource, cb){
    var logoUrl = database[selectedSource]["logo"];
    sourceLogo.src = logoUrl;
    cb(selectedSource);
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
          database[source.name] = {};
          database[source.name]['name'] = source.name;
          database[source.name]['id']   = source.id;
          database[source.name]['logo'] = source.urlsToLogos.small;
        });
        // 2
        cb(database);
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
      cb(selectedSource);
    });
    xhr.open('GET', url, true);
    xhr.send();
  }

  function processHeadlines(selectedSource, cb){
    var headlines = selectedSource.headlines;
    console.log(headlines.length);
    var topics = {};
    headlines.forEach(function(el) {
      requestConstructor(el, topics);
    });
    setTimeout(function() {
      cb(topics);
    }, 1000);
  }

  // Text Razor requests
  function requestConstructor(headline, topics) {
    var http = new XMLHttpRequest();
    var url = 'https://api.textrazor.com/';
    var params = 'text=' + headline.title + '&extractors=topics';
    params = encodeURI(params);

    http.open('POST', url, true);

    http.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
    http.setRequestHeader('X-TextRazor-Key', apiKeys.textRazorKey);

    http.onreadystatechange = function() {
      if(http.readyState == 4 && http.status == 200) {
        var result = JSON.parse(http.responseText);
        headline.topics = [];
        if(result.response.coarseTopics) {
          result.response.coarseTopics.forEach(function(el){
            headline.topics.push({name: el.label, score: el.score});
            if(el.score > 0.5) {
              if(topics[el.label]) {
                topics[el.label] += el.score;
              } else {
                topics[el.label] = el.score;
              }
            }
          });
        }
      }
    };
    http.send(params);
  }

})();
