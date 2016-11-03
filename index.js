// Initialise api keys
var textRazorKey = apiKeys.textRazorKey;
var newsApiKey = apiKeys.newsApiKey;

// DOM Elements
var sourceDropDown = document.getElementById("source-dropdown"),
    analyzeBtn = document.getElementById("analyze"),
    sourceLogo = document.getElementById("source-logo"),
    headLines = document.getElementById("headlines"),
    infoGraphicContainer = document.getElementById("infographic-container"),
    pageTitle = document.getElementById("page-title");

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
    waterfall(sourceDropDown.value, [updateLogo, getHeadlines, updateArticles, addToggleToHeadlines]);
    analyzeBtn.disabled = false;
});

// Analyze
analyzeBtn.addEventListener("click", function(){
  buildInfoGraph();
  toggleInfographic();
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



// Add onClick functionality when headlines loaded
function addToggleToHeadlines() {
  var headlines = document.querySelectorAll('.headline');
  for(var i = 0; i < headlines.length; i++) {
    headlines[i].addEventListener('click', function() {
      var description = this.querySelector('p');
      description.style.display = description.style.display === 'inherit' ? 'none' : 'inherit';
    });
  };
}



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

function updateArticles(selectedSource, cb) {
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
  cb(selectedSource);
}

function updateLogo(selectedSource, cb){

  var logoUrl = database[selectedSource]["logo"];
      sourceLogo.src = logoUrl;

  cb(selectedSource);
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


/* Infographic builder */
function buildInfoGraph(){

    if (infoGraphicContainer.children){
      infoGraphicContainer.innerHTML = "";
    };
    var data = topicsCount;
    /* BEM */
    var blockClass = "graph",
        elementClass = blockClass + "__item",
        modifierClass = [
          "--color1",
          "--color2",
          "--color3",
          "--color4",
          "--color5",
          "--color6",
          "--color7",
          "--color8",
          "--color9",
          "--color10",
        ];

    /* Create ul */
    var ul = document.createElement("ul");
        ul.classList.add(blockClass);

    var colorIndex = 0;
    /* for each data piece */
    for (var prop in data) {

        /* Create element */
        var li = document.createElement("li");
            li.textContent = prop;

        /* convert 0-1 float val to percent */
        var percent = (data[prop] * 100).toFixed(0) + "%";

            li.style.width = percent;
            li.setAttribute("percent", percent);


        /* assign random color modifier */
        var randomColor = modifierClass[colorIndex];
            colorIndex++;

            li.classList.add(elementClass);
            li.classList.add(elementClass + randomColor);

        /* add li to ul */
        ul.appendChild(li);
    }

    /* add to infoGraphicContainer */
    infoGraphicContainer.appendChild(ul);
}

/* toggle infographic */
function toggleInfographic(){
  if (infoGraphicContainer.classList.contains("infographic-container--hidden")) {
    infoGraphicContainer.classList.remove("infographic-container--hidden");
    pageTitle.textContent = sourceDropDown.value;
    analyzeBtn.textContent = "Back";
  } else {
    infoGraphicContainer.classList.add("infographic-container--hidden");
    pageTitle.textContent = "Visualiser News";
    analyzeBtn.textContent = "Analyze";
  }
}

/* Dummy Data */
var topicsCount = {
  politics: 0.3,
  social: 0.3,
  culture: 0.42,
  government: 0.143,
  religion: 0.7
};
