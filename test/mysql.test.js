var should = require('should'),
    DatabaseCleaner = require('../lib/database-cleaner'),
    _ = require('lodash'),
    async = require('async'),
    databaseCleaner;

var mysql = require('mysql'),
    client = new mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: 'root',
      database: 'database_cleaner'
    }),
    pool = new mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: 'root',
      database: 'database_cleaner'
    });

var queryClient = _.curry(function(query, values, next) {
  client.query(query, values, next);
});

describe('mysql', function() {
  beforeEach(function(done) {
    client.query('CREATE DATABASE database_cleaner', function(err) {
      if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
        throw err;
      }
    });

    async.series([
      queryClient('CREATE TABLE test1 (id INTEGER NOT NULL AUTO_INCREMENT, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', []),
      queryClient('CREATE TABLE test2 (id INTEGER NOT NULL AUTO_INCREMENT, title VARCHAR(255) NOT NULL, PRIMARY KEY(id))', []),
      queryClient('INSERT INTO test1(title) VALUES(?)', ["foobar"]),
      queryClient('INSERT INTO test2(title) VALUES(?)', ["foobar"]),
      queryClient('CREATE TABLE schema_migrations (id INTEGER NOT NULL AUTO_INCREMENT, version VARCHAR(255) NOT NULL, PRIMARY KEY(id));', []),
      queryClient('INSERT INTO schema_migrations(version) VALUES(?)', ["20150716190240"])
    ], done);
  });

  afterEach(function(done) {
    async.parallel([
      queryClient("DROP TABLE test1", []),
      queryClient("DROP TABLE test2", []),
      queryClient("DROP TABLE schema_migrations", [])
    ], done);
  });

  describe('with default config', function() {
    before(function(done) {
      databaseCleaner = new DatabaseCleaner('mysql');
      done();
    });

    it('should delete all not skippedTables records', function(done) {
      databaseCleaner.clean(client, function() {
        async.parallel([
          queryClient("SELECT * FROM test1", []),
          queryClient("SELECT * FROM test2", [])
        ], function(err, results) {
          if (err) return done(err);

          results[0][0].length.should.equal(0);
          results[1][0].length.should.equal(0);

          done();
        });
      });
    });

    it('should retain schema_migrations', function(done) {
      databaseCleaner.clean(client, function() {
        client.query("SELECT * FROM schema_migrations", function(err, result) {
          result.length.should.equal(1);
          done();
        });
      });
    });

    it('should retain schema_migrations', function(done) {
      databaseCleaner.clean(client, function() {
        client.query("SELECT * FROM schema_migrations", function(err, result) {
          result.length.should.equal(1);
          done();
        });
      });
    });
  });

  describe('with provided config', function() {
    before(function(done) {
      var config = { mysql: { skipTables: [] } };

      databaseCleaner = new DatabaseCleaner('mysql', config);
      done();
    });

    it('should NOT retain schema_migrations since the config did not have any tables to skip', function(done) {
      databaseCleaner.clean(client, function() {
        client.query("SELECT * FROM schema_migrations", function(err, result) {
          result.length.should.equal(0);
          done();
        });
      });
    });

  });

  describe('truncation strategy', function() {
    before(function(done) {
      var config = { mysql: { strategy: 'truncation', skipTables: [] } };

      databaseCleaner = new DatabaseCleaner('mysql', config);
      done();
    });

    it('should truncate all not skippedTables records', function(done) {
      databaseCleaner.clean(client, function() {
        async.parallel([
          queryClient("SELECT * FROM test1", []),
          queryClient("SELECT * FROM test2", [])
        ], function(err, results) {
          if (err) return done(err);

          results[0][0].length.should.equal(0);
          results[1][0].length.should.equal(0);

          done();
        });
      });
    });
  });

  describe('with pooled connection', function() {
    before(function(done) {
      databaseCleaner = new DatabaseCleaner('mysql');
      done();
    });

    it('should not error with a pooled connection', function(done) {
      databaseCleaner.clean(pool, done);
    });
  });
});

describe('mysql empty', function() {
   beforeEach(function(done) {
    client.query('CREATE DATABASE database_cleaner', function(err) {
      if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
        throw err;
      }
      done();
    });
  });

  it('should not stuck if database is empty', function(done) {
    databaseCleaner.clean(client, done);
  });
});
