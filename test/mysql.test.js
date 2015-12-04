var should = require('should'),
    DatabaseCleaner = require('../lib/database-cleaner'),
    databaseCleaner = new DatabaseCleaner('mysql');

var mysql = require('mysql'),
    client = new mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: 'root',
      database: 'database_cleaner',
    });

describe('mysql', function() {
  beforeEach(function(done) {
    client.query('CREATE DATABASE database_cleaner', function(err) {
      if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
        throw err;
      }
    });

    client.query('CREATE TABLE test1 (id INTEGER NOT NULL AUTO_INCREMENT, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', function() {
      client.query('CREATE TABLE test2 (id INTEGER NOT NULL AUTO_INCREMENT, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', function() {
        client.query('INSERT INTO test1(title) VALUES(?)', ["foobar"], function() {
          client.query('INSERT INTO test2(title) VALUES(?)', ["foobar"], function() {
            client.query('CREATE TABLE schema_migrations (id INTEGER NOT NULL AUTO_INCREMENT, version VARCHAR(255) NOT NULL, PRIMARY KEY(id));', function() {
              client.query('INSERT INTO schema_migrations(version) VALUES(?)', ["20150716190240"], done);
            });
          });
        });
      });
    });
  });

  afterEach(function(done) {
    client.query("DROP TABLE test1", function() {
      client.query("DROP TABLE test2", function() {
        client.query("DROP TABLE schema_migrations", function() {
          done();
        });
      });
    });
  });

  it('should delete all not skippedTables records', function(done) {
    databaseCleaner.clean(client, function() {
      client.query("SELECT * FROM test1", function(err, result_test1) {
        client.query("SELECT * FROM test2", function(err, result_test2) {
          result_test1.length.should.equal(0);
          result_test2.length.should.equal(0);
          done();
        });
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
