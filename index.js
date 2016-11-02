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
