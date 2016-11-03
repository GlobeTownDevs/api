// Initialise api keys
var textRazorKey = apiKeys.textRazorKey;
var newsApiKey = apiKeys.newsApiKey;

// DOM Elements
var sourceDropDown = document.getElementById("source-dropdown"),
    analyzeBtn = document.getElementById("analyze");


// Global Database
var database = {};

// Waterfall function (no error handling)
function waterfall(start, tasks) {
  var next = tasks[0];
  var tail = tasks.slice(1);
  if (typeof next !== 'undefined') {
    next(start, function(result) {
      waterfall(result, tail)
    })
    return ;
  }
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
    waterfall(sourceDropDown.value, [getHeadlines, activateAnalyzeBtn]);
});

// Analyze
analyzeBtn.addEventListener("click", function(){
    // here we need functions to process headlines...
});




// function to build options for sourceDropDown select elements
function buildOptions(database){
    for (var source in database){
        var option = document.createElement("option");
            option.textContent = source;
            option.value = source;
        sourceDropDown.appendChild(option);
    };
};


// activate/deactivate analyzeBtn;
function activateAnalyzeBtn(){
  analyzeBtn.disabled = false;
};

function deactivateAnalyzeBtn(){
  analyzeBtn.disabled = true;
};


// 1. getSources called on window load
function getSources(database, cb){

    var url = "https://newsapi.org/v1/sources?language=en&country=gb";
        url += "&apikey=" + newsApiKey;

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

  var url = "https://newsapi.org/v1/articles?";
      url += "source=" + selectedSource.id + "&apikey=" + newsApiKey;

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








// Text Razor requests
function requestConstructor(headline) {
  var http = new XMLHttpRequest();
      http.withCredentials = true;
  var url = "https://api.textrazor.com/";
  var params = "text=" + headline.title + "&extractors=topics";
      params = encodeURI(params);
  console.log(params)

  http.open("POST", url, true);

  http.setRequestHeader("content-type", "application/x-www-form-urlencoded");
  http.setRequestHeader("X-TextRazor-Key", textRazorKey);
  http.send(params);
  // http.setRequestHeader("cache-control", "no-cache");

  http.onreadystatechange = function() {
    if(http.readyState == 4 && http.status == 200) {
      var result = JSON.parse(http.responseText);
      headline.topics = [];
      result.response.coarseTopics.forEach(function(el){
        headline.topics.push({name: el.label, score: el.score});
        if(el.score > 0.5) {
          if(topicsCount[el.label]) {
            topicsCount[el.label] += el.score;
          } else {
            topicsCount[el.label] = el.score;
          }
        }
      });
      // 5
      console.log(database);
      console.log(topicsCount);
    }
  }
}

function processHeadlines(headlines){
  headlines.forEach(function(el) {
    // 4
    requestConstructor(el);
  });
  return topicsCount;
}

var topicsCount = {};
