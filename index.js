// Initialise api keys
var textRazorKey = apiKeys.textRazorKey;
var newsApiKey = apiKeys.newsApiKey;

// Example db //
var database = {};

// News API requests

/* getSources
retrieves news sources, stores in database object
needs getSources() on window load!
*/
function getSources(){

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
                console.log(database);
                // this will be removed when we implement a callback/waterfall/eventListener
                getHeadlines(database["BBC News"]);
        });
        xhr.open('GET', url, true);
        xhr.send();

}

// 1st make sources request, store results in array with sources


/* getHeadlines
retrieves first 10 headlines for a selected source
*/

getSources();


function getHeadlines(selectedSource) {
  var url = "https://newsapi.org/v1/articles?";
      url += "source=" + selectedSource.id + "&apikey=" + newsApiKey;

  var xhr = new XMLHttpRequest();
      xhr.addEventListener("load", function(){
        var json = JSON.parse(xhr.responseText);
        database[selectedSource.name]["headlines"] = [];
        json.articles.forEach(function(article) {
          delete article["author"];
          database[selectedSource.name]["headlines"].push(article);
        });
        console.log(database);
      });
      xhr.open('GET', url, true);
      xhr.send();
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
