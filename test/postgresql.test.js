var should = require('should'),
    DatabaseCleaner = require('../lib/database-cleaner'),
    databaseCleaner = new DatabaseCleaner('postgresql');


var dbHost = process.env.POSTGRES_HOST || 'localhost';

var connectionString = 'postgres://postgres@' + dbHost  + '/database_cleaner';

var pg = require('pg');

describe('pg', function() {
  beforeEach(function(done) {

    _done = done;

    pg.connect(connectionString, function(err, client, done) {
      if (err) {
        return console.error('could not connect to postgresql', err);
      }

      client.query('CREATE DATABASE database_cleaner', function(err) {
        if (err && err.code != '42P04') {
          throw err;
        }
      });

      client.query('CREATE TABLE test1 (id SERIAL, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', function() {
        client.query('CREATE TABLE test2 (id SERIAL, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', function() {
          client.query('INSERT INTO test1 (title) VALUES ($1);', ["foobar"], function() {
            client.query('INSERT INTO test2 (title) VALUES ($1);', ["foobar"], function() {
              done();
              _done();
            });
          });
        });
      });
    });

  });

  afterEach(function(done) {
    _done = done;

    pg.connect(connectionString, function(err, client, done) {
      client.query("DROP TABLE test1", function() {
        client.query("DROP TABLE test2", function() {
          done();
          _done();
        });
      });
    });
  });

  it('should delete all records', function(done) {
    _done = done;

    pg.connect(connectionString, function(err, client, done) {
      databaseCleaner.clean(client, function() {
        client.query("SELECT * FROM test1", function(err, result_test1) {
          client.query("SELECT * FROM test2", function(err, result_test2) {
            result_test1.rows.length.should.equal(0);
            result_test2.rows.length.should.equal(0);
            done();
            _done();
          });
        });
      });
    });
  });

});
