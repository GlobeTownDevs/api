/* When testing in development, run the following command in console first before opening chrome;
(mac) - open -a Google\ Chrome --args --disable-web-security --user-data-dir
(windows) google-chrome --disable-web-security --user-data-dir
*/

var visualiser = (function() {

  // DOM Elements
  var sourceDropDown = document.getElementById("source-dropdown"),
      analyzeBtn = document.getElementById("analyze"),
      sourceLogo = document.getElementById("source-logo"),
      headLines = document.getElementById("headlines"),
      infoGraphicContainer = document.getElementById("infographic-container"),
      pageTitle = document.getElementById("page-title");

  // Global variables
  var database = this.database = {};
  var topicsCount = this.topicsCount = {};

  // Waterfall function. arg= initial argument. tasks= array of async functions. cb= final function
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
      waterfall(database,
        [
          getSources,
            buildOptions
              ],
                function(err, result) {/* console.log(result) */});
  });

  // Dropdown
  sourceDropDown.addEventListener("change", function(){
      waterfall(sourceDropDown.value,
        [
          emptyTopicsObject,
            deactivateAnalyzeBtn,
              updateLogo,
                getHeadlines,
                  updateArticles,
                    addToggleToHeadlines,
                      activateAnalyzeBtn
                        ],
                          function(err, result) {/* console.log(result) */});
  });

  // Analyze
  analyzeBtn.addEventListener("click", function(){
    if (!Object.keys(topicsCount).length) {
      waterfall(sourceDropDown.value,
        [
          deactivateAnalyzeBtn,
            emptyTopicsObject,
              getHeadlines,
                processHeadlines,
                  normalise,
                    fillTopicsObject,
                      buildInfoGraph,
                        toggleInfographic,
                          activateAnalyzeBtn
                            ],
        function(err, result) {/* console.log(result) */});

    } else {
      toggleInfographic(topicsCount,
        function(err, result) {/* console.log(result) */});
    }
  });


  //// Async functions ////

  // updateLogo. receives: source name. responds: source name.
  function updateLogo(selectedSource, cb){
    var logoUrl = database[selectedSource]["logo"];
    sourceLogo.src = logoUrl;
    cb(null, selectedSource);
  }

  // buildOptions. receives: database, responds: database;
  function buildOptions(database, cb){
    for (var source in database){
      var option = document.createElement("option");
      option.textContent = source;
      option.value = source;
      sourceDropDown.appendChild(option);
    }
    cb(null, database);
  }

  // activate/deactive button functions. receives: (any input). responds (same as input)
  function activateAnalyzeBtn(arg, cb){
    analyzeBtn.disabled = false;
    cb(null, arg);
  }

  function deactivateAnalyzeBtn(arg, cb){
    analyzeBtn.disabled = true;
    cb(null, arg);
  }


  // emptyTopicsObject. receives: source name, responds: source name.
  function emptyTopicsObject(selectedSource, cb){
    topicsCount = {};
    cb(null, selectedSource);
  }
  // emptyTopicsObject. receives: topics object, responds: topics object
  function fillTopicsObject(topics, cb){
    topicsCount = topics;
    cb(null, topics);
  };

  // Add onClick functionality when headlines loaded
  function addToggleToHeadlines(arg, cb) {
    var headlines = document.querySelectorAll('.headline');
    for(var i = 0; i < headlines.length; i++) {
      headlines[i].addEventListener('click', function() {
        var description = this.querySelector('p');
        description.style.display = description.style.display === 'inherit' ? 'none' : 'inherit';
      });
    };
    cb(null, arg);
  }

  // getSources. receives: database. responds: database
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

// getHeadlines. receives: source name, responds: source object from database
  function getHeadlines(selectedSource, cb) {
    //assigns appropriate db object
    selectedSource = database[selectedSource];

    var url = "https://newsapi.org/v1/articles?" + "source=" + selectedSource.id + "&apikey=" + apiKeys.newsApiKey;
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function(){
      var json = JSON.parse(xhr.responseText);
      //assigns source object an array to append headline objects
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

// updateArticles. receives: source object from db. responds: source object from db
function updateArticles(selectedSource, cb) {
  //remove previous headlines
  headLines.innerHTML = "";
  selectedSource["headlines"].forEach(function(headline) {
    // creating new elements
    var article = document.createElement("article");
        article.classList.add("headline");
    var image = document.createElement("img");
        image.classList.add("headline__image");
        image.src = headline["urlToImage"];
    var heading = document.createElement("h1");
        heading.classList.add("headline__title");
        heading.textContent = headline["title"];
    var description = document.createElement("p");
        description.classList.add("headline__description");
        description.textContent = headline["description"];

    // populating new elements
    article.appendChild(image);
    article.appendChild(heading);
    article.appendChild(description);
    // Append to headlines
    headLines.appendChild(article);
  });
  cb(null, selectedSource);
}


  // processHeadLines. receives: select source object from db. responds: topics object
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

  // analyzeHeadline. receives: headline index, topics object, headlines object. responds: topics object
  function analyseHeadline(i, topics, headlines, cb) {
    var headline = headlines[i];
    var http = new XMLHttpRequest();
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
  };

// Infographic builder. receives: topics object. responds: topic object
function buildInfoGraph(topics, cb){
    // clear existing infoGraphicContainer content
    if (infoGraphicContainer.children){
      infoGraphicContainer.innerHTML = "";
    };

    /* BEM */
    var blockClass = "graph",
        elementClass = blockClass + "__item",
        modifierClass = [1,2,3,4,5,6,7,8,9,10].map(c=> "--color" + c);

    /* Create ul */
    var ul = document.createElement("ul");
        ul.classList.add(blockClass);
    // holds index of modifiers
    var colorIndex = 0;

    for (var prop in topics) {
        /* Create element */
        var li = document.createElement("li");
            li.textContent = prop;

        /* convert 0-1 float value to percent */
        var percent = (topics[prop] * 100).toFixed(0) + "%";
            li.style.width = percent;
            li.setAttribute("percent", percent);

        /* assign color modifier */
        var color = modifierClass[colorIndex];
            colorIndex++;
            li.classList.add(elementClass);
            li.classList.add(elementClass + color);

        /* add li to ul */
        ul.appendChild(li);
    }
    /* add to infoGraphicContainer */
    infoGraphicContainer.appendChild(ul);
    cb(null, topics);
}

// toggleInfographic. receives: topics object, responds: topic object.
function toggleInfographic(topics, cb){
  if (infoGraphicContainer.classList.contains("infographic-container--hidden")) {
    infoGraphicContainer.classList.remove("infographic-container--hidden");
    pageTitle.textContent = sourceDropDown.value;
    analyzeBtn.textContent = "Back";
  } else {
    infoGraphicContainer.classList.add("infographic-container--hidden");
    pageTitle.textContent = "Visualiser News";
    analyzeBtn.textContent = "Analyze";
  }
  cb(null, topics);
}

})();
