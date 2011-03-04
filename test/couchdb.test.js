var testCase = require('nodeunit').testCase,
    DatabaseCleaner = require('../lib/database-cleaner'),
    databaseCleaner = new DatabaseCleaner('couchdb'),
    cradle = require('cradle'),
    db = new(cradle.Connection)().database('database_cleaner');;

module.exports = testCase({
  setUp: function (callback) {
    db.create();
    db.save({nodejs: 'is', realy: 'awesome'}, function (err, res) {
      callback();
    });
  },
  'should have 0 docs after drop and create':function (test) {
    databaseCleaner.clean(db, function() {
      db.all(function(err, res) {
        test.equal(res.total_rows, 0);
        test.done();
      });
    });
  }
});
