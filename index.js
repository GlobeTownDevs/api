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
