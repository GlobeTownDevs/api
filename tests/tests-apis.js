QUnit.test("that we can add topics to the database object", function(assert){
  var done = assert.async();
  var headline = Object.assign({}, headlines[0]); /* This creates a copy of headlines[0] */
  requestConstructor(headline);
  setTimeout(function(){
    assert.ok(headline.topics, 'Passed!');
    done();
  },10);
});

QUnit.test("that we can add topics to the topicsCount object", function(assert){
  var done = assert.async();
  processHeadlines(headlines);
  setTimeout(function(){
    assert.ok(topicsCount.Politics, 'Passed!');
    console.log(topicsCount);
    done();
  },10);
});
