var should = require('should'),
    sqlite3 = require('sqlite3'),
    _ = require('lodash'),
    async = require('async');
    DatabaseCleaner = require('../lib/database-cleaner'),
    databaseCleaner = new DatabaseCleaner('sqlite');

describe.only('sqlite', function() {
  var client;
  var queryClient;

  beforeEach(function(done) {
    client = new sqlite3.Database(':memory:');
    queryClient = _.curry(function(query, values, next) {
      client.all(query, values, next);
    });

    async.series([
      queryClient('CREATE TABLE test1 (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(255) NOT NULL);', []),
      queryClient('CREATE TABLE test2 (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(255) NOT NULL)', []),
      queryClient('INSERT INTO test1(title) VALUES(?)', ["foobar"]),
      queryClient('INSERT INTO test2(title) VALUES(?)', ["foobar"]),
      queryClient('CREATE TABLE schema_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, version VARCHAR(255) NOT NULL);', []),
      queryClient('INSERT INTO schema_migrations(version) VALUES(?)', ["20150716190240"])
    ], done);
  });

  context('with default config', function() {
    beforeEach(function() {
      databaseCleaner = new DatabaseCleaner('sqlite');
    });

    it('should delete all not skippedTables records', function(done) {
      databaseCleaner.clean(client, function() {
        async.parallel([
          queryClient("SELECT * FROM test1", []),
          queryClient("SELECT * FROM test2", [])
        ], function(err, results) {
          should.not.exist(err);

          results[0].should.have.length(0);
          results[1].should.have.length(0);

          done();
        });
      });
    });

    it('should retain schema_migrations', function(done) {
      databaseCleaner.clean(client, function() {
        queryClient("SELECT * FROM schema_migrations", [], function(err, result) {
          should.not.exist(err);
          result.should.have.length(1);
          done();
        });
      });
    });

    it('should leave sqlite_sequence intact', function(done) {
      databaseCleaner.clean(client, function() {
        queryClient("SELECT * FROM sqlite_sequence", [], function(err, result) {
          should.not.exist(err);
          result.should.have.length(3);
          done();
        });
      });
    });

    context('when the db is empty', function() {
      beforeEach(function() {
        client = new sqlite3.Database(':memory:');
      });

      it('should return without timing out', function(done) {
        databaseCleaner.clean(client, done);
      });
    });
  });

  context('with provided config', function() {
    beforeEach(function() {
      var config = { sqlite: { skipTables: [] } };

      databaseCleaner = new DatabaseCleaner('sqlite', config);
    });

    it('should NOT retain schema_migrations since the config did not have any tables to skip', function(done) {
      databaseCleaner.clean(client, function() {
        queryClient("SELECT * FROM schema_migrations", [], function(err, result) {
          result.should.have.length(0);
          done();
        });
      });
    });

    it('should leave sqlite_sequence intact', function(done) {
      databaseCleaner.clean(client, function() {
        queryClient("SELECT * FROM sqlite_sequence", [], function(err, result) {
          should.not.exist(err);
          result.should.have.length(3);
          done();
        });
      });
    });

    context('when the db is empty', function() {
      beforeEach(function() {
        client = new sqlite3.Database(':memory:');
      });

      it('should return without timing out', function(done) {
        databaseCleaner.clean(client, done);
      });
    });
  });
});
