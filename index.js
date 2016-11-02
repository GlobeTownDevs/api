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
        });
        xhr.open('GET', url, true);
        xhr.send();
}

// 1st make sources request, store results in array with sources






// Text Razor requests
