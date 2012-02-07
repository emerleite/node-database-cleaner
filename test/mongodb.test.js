var should = require('should'),
    DatabaseCleaner = require('../lib/database-cleaner'),
    databaseCleaner = new DatabaseCleaner('mongodb'),
    connect = require('mongodb').connect;

function setUp(callback) {
  connect('mongodb://localhost/database_cleaner', function(err, db) {
    db.createCollection("database_cleaner_collection", null, function (err, collection) {
      collection.insert([{a:1}, {b:2}], function() {
        callback(db);
      });
    });
  });
}

function setUpEmptyDb(callback) {
  connect('mongodb://localhost/database_cleaner_empty', function(err, db) {
    callback(db);
  });
}

function tearDown(db) {
  db.close();  
}

describe('mongodb', function() {
  it('should delete all collections items', function(done) {
    setUp(function(db) {
      databaseCleaner.clean(db, function () {
        db.collections( function (skip, collections) {
          var total_collections = collections.length;
          collections.forEach(function (collection) {
            collection.count({}, function (err, count) {
              count.should.equal(0);
              if (--total_collections <= 0) {
                tearDown(db);
                done();
              }
            });
          });
        });
      });
    });
  });

  it('should invoke callback even if database has no collections', function(done) {
    setUpEmptyDb(function(db) {
      databaseCleaner.clean(db, function () {
        done();
      });
    });
  });

  it('should also delete system.indexes collection', function(done) {
    setUp(function(db) {
      databaseCleaner.clean(db, function () {
        db.collection('system.indexes', function (skip, collection) {
          collection.count({}, function (err, count) {
            (count > 0).should.be.false;
            done();
            tearDown(db);
          });
        });
      });
    });
  });

});
