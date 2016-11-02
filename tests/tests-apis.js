QUnit.test("that we can add topics to the database object", function(assert){
  var done = assert.async();
  var headline = {
    title: "Irish PM warns Brexit talks between UK and EU could turn vicious Enda Kenny urges his fellow EU leaders not to become ‘obsessed’ over what Britain may or may not get in Brexit negotiations"
  }
  requestConstructor(headline);
  setTimeout(function(){
    assert.ok(headline.topics, 'Passed!');
    done();
  },10);
});

QUnit.test("that we can add topics to the topicsCount object", function(assert){
  var done = assert.async();
  var headline = {
    title: "Irish PM warns Brexit talks between UK and EU could turn vicious Enda Kenny urges his fellow EU leaders not to become ‘obsessed’ over what Britain may or may not get in Brexit negotiations"
  }
  processHeadlines([headline]);
  setTimeout(function(){
    assert.ok(topicsCount.Politics, 'Passed!');
    console.log(topicsCount);
    done();
  },10);
});
