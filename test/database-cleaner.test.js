var testCase = require('nodeunit').testCase,
    databaseCleaner = require('lib/database-cleaner');
var mongoose = require('mongoose');

module.exports = testCase({
  setUp: function (callback) {
    this.connection = mongoose.createConnection('mongodb://localhost/database_cleaner');
    this.connection.db.createCollection("database_cleaner_collection", null, function (err, collection) {
      collection.insertAll([{a:1}, {b:2}], function() {
        callback();
      });
    });
  },
  tearDown: function (callback) {
    this.connection.close();
    this.connection = null;
    callback();
  },
  'should delete all collections items': function(test) {
    var db = this.connection.db;
    databaseCleaner.clean(db, function () {
      db.collections( function (skip, collections) {
        var total_collections = collections.length;
        collections.forEach(function (collection) {
          if (collection.collectionName != 'system.indexes') {
            collection.count({}, function (err, count) {
              test.equal(count, 0);
              total_collections--;
              if (total_collections <= 0) {
                test.done();
              }
            });
          } else { 
            total_collections--; 
          }
        });
      });
    });
  },
  'should not delete system.indexes collection': function(test) {
    var db = this.connection.db;
    databaseCleaner.clean(db, function () {
      db.collection('system.indexes', function (skip, collection) {
        collection.count({}, function (err, count) {
          console.log("system.indexes count:" + count);
          test.ok(count > 0);
          test.done();
        });
      });
    });
  }
});
