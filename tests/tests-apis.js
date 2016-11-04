// Waterfall
QUnit.test("Waterfall Function", function(assert){
  var done = assert.async();
    // Add Two
    var asyncAddTwo = function(x, cb) {
    setTimeout(function() {
      if (typeof x !== 'number') return cb(new Error('need a number!'))
      return cb(null, x + 2)
    }, 200)};
    // Double
    var asyncDouble = function(x, cb) {
      setTimeout(function() {
        if (typeof x !== 'number') return cb(new Error('need a number!'))
        return cb(null, x*2)
      }, 200)};
    // Modulo 7
    var asyncModSeven = function(x, cb) {
      setTimeout(function() {
        if (typeof x !== 'number') return cb(new Error('need a number!'))
        return cb(null, x % 7)
      }, 200)}
    //4. (failure)
    var doBadStuff = function(x, cb) {
      setTimeout(function() {
        if (typeof x == 'number') return cb(new Error('I cant deal with numbers!'))
        return cb(null, x % 7)
      }, 200)}

  // Can chain together
  waterfall(3, [asyncAddTwo,asyncDouble,asyncModSeven], function(error, result) {
    if (error) {assert.not.ok(true, "Shouldn't throw an error")};
    assert.ok(result == 3, "Should be able to chain asynchronous functions (returns 3)");
  });
  // Can catch errors
  waterfall(3, [asyncAddTwo,doBadStuff,asyncDouble,asyncModSeven], function(error, result) {
    if (error) {assert.ok(error, "Can catch errors: " + error)};
    done();
  });
});


// Normalize
QUnit.test("Normalise Functions", function(assert){
  var topics = {
    politics: 4,
    news: 9.6,
    sports: 3
  };
  normalise(topics, function(na, results){
    assert.ok(results['politics'] <= 1, "4 became " + results['politics']);
    assert.ok(results['news']   <= 1, "9.6 became " + results['news']);
    assert.ok(results['sports'] <= 1, "3 became " + results['sports']);
  })

});



// QUnit.test("that we can add topics to the database object", function(assert){
//   var done = assert.async();
//   var headline = Object.assign({}, headlines[0]); /* This creates a copy of headlines[0] */
//   requestConstructor(headline);
//   setTimeout(function(){
//     assert.ok(headline.topics, 'Passed!');
//     done();
//   },1000);
// });
//
// QUnit.test("that we can add topics to the topicsCount object", function(assert){
//   var done = assert.async();
//   processHeadlines(headlines);
//   setTimeout(function(){
//     assert.ok(topicsCount.Politics, 'Passed!');
//     done();
//   },1000);
// });
