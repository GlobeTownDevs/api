// Initialise api keys
var textRazorKey = apiKeys.textRazorKey;
var newsApiKey = apiKeys.newsApiKey;

// Example db //
var database = {
        "BBC": {
            "name": "BBC News",
            "id": "bbc-news",
            "headline": [{
                "title": "something serious",
                "description": "this is an article about something totally serious",
                "topics": [
                    {
                    "name":"politics",
                    "score":0.64
                    },{
                    "name":"arts",
                    "score":0.98
                    }
                ]
            }]
        },
        "mirror": {
            "name": "Mirror",
            "id": "bbc-news",
            "headline": [{
                "title": "something serious",
                "description": "this is an article about something totally serious",
                "topics": [
                    {
                    "name":"politics",
                    "score":0.64
                    },{
                    "name":"arts",
                    "score":0.98
                    }
                ]
            }]
        }
    }

// News API requests

// 1st make sources request, store results in array with sources

function itilaize (){

    global.sources = xhr.responseText.

}

function (source) {

 var xhr = new XMLHttpRequest();

 global[source]["headline"] = xhr.responseText


}
// Text Razor requests
function requestConstructor(headline) {
  var http = new XMLHttpRequest();
  var url = "https://api.textrazor.com";
  var params = "text=" + headline.title.replace(/\s/g, '+') + "&extractors=topics";

  http.open("POST", url, true);

  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.setRequestHeader("X-TextRazor-Key", textRazorKey);

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
    }
  }
  http.send(params);
}

function processHeadlines(headlines){
  headlines.forEach(function(el) {
    requestConstructor(el);
  });
  return topicsCount;
}

var topicsCount = {};
