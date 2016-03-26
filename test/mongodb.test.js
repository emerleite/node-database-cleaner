var should = require('should'),
    DatabaseCleaner = require('../lib/database-cleaner'),
    databaseCleaner = new DatabaseCleaner('mongodb'),
    connect = require('mongodb').connect;

var dbHost = process.env.MONGO_HOST || 'localhost';

function setUp(callback) {
  connect('mongodb://' + dbHost + '/database_cleaner', function(err, db) {
    db.createCollection("database_cleaner_collection", null, function (err, collection) {
      db.createCollection("schema_migrations", null, function (err, collection) {
        collection.insert([{a:1}, {b:2}], function() {
          callback(db);
        });
      });
    });
  });
}

function setUpEmptyDb(callback) {
  connect('mongodb://' + dbHost + '/database_cleaner_empty', function(err, db) {
    callback(db);
  });
}

function tearDown(db) {
  db.close();
}

describe('mongodb', function() {
  it('should delete all collections except the skipped and system.indexes', function(done) {
    setUp(function(db) {
      databaseCleaner.clean(db, function () {
        db.collections( function (skip, collections) {
          collections.length.should.equal(2);
          tearDown(db);
          done();
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
});
