var should = require('should'),
    pg = require('pg'),
    _ = require('lodash'),
    async = require('async');
    DatabaseCleaner = require('../lib/database-cleaner'),
    databaseCleaner = new DatabaseCleaner('postgresql');

var dbHost = process.env.POSTGRES_HOST || 'localhost';
var connectionString = 'postgres://postgres@' + dbHost  + '/database_cleaner';

var queryClient = _.curry(function(client, query, values, next) {
  client.query(query, values, next);
});

describe('pg', function() {
  beforeEach(function(done) {
    pg.connect(connectionString, function(err, client, release) {
      if (err) return done(err);

      client.query('CREATE DATABASE database_cleaner', function(err) {
        if (err && err.code != '42P04') {
          throw err;
        }
      });

      async.series([
        queryClient(client, 'CREATE TABLE test1 (id SERIAL, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', []),
        queryClient(client, 'CREATE TABLE test2 (id SERIAL, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', []),
        queryClient(client, 'CREATE TABLE \"Test3\" (id SERIAL, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', []),
        queryClient(client, 'CREATE TABLE schema_migrations (id SERIAL, version VARCHAR(255) NOT NULL, PRIMARY KEY(id));', []),
        queryClient(client, 'INSERT INTO test1 (title) VALUES ($1);', ["foobar"]),
        queryClient(client, 'INSERT INTO test2 (title) VALUES ($1);', ["foobar"]),
        queryClient(client, 'INSERT INTO \"Test3\" (title) VALUES ($1);', ["foobar"]),
        queryClient(client, 'INSERT INTO schema_migrations (version) VALUES ($1);', ["20150716190240"]),
        function(next) { release(); next(); },
      ], done);
    });
  });

  afterEach(function(done) {
    pg.connect(connectionString, function(err, client, release) {
      if (err) return done(err);

      async.parallel([
        queryClient(client, "DROP TABLE test1", []),
        queryClient(client, "DROP TABLE test2", []),
        queryClient(client,  "DROP TABLE \"Test3\"", []),
        queryClient(client, "DROP TABLE schema_migrations", []),
        function(next) { release(); next(); },
      ], done);
    });
  });

  it('should delete all non skippedTable records', function(done) {
    pg.connect(connectionString, function(err, client, release) {
      if (err) return done(err);

      databaseCleaner.clean(client, function() {
        async.parallel([
          queryClient(client, "SELECT * FROM test1", []),
          queryClient(client, "SELECT * FROM test2", [])
        ], function(err, results) {
          results[0].rows.length.should.equal(0);
          results[1].rows.length.should.equal(0);

          release();
          done();
        });
      });
    });
  });

  it('should delete all records when table name is capitalized', function(done) {
    pg.connect(connectionString, function(err, client, release) {
      if (err) return done(err);

      databaseCleaner.clean(client, function() {
        async.parallel([
          queryClient(client, "SELECT * FROM test1", []),
          queryClient(client, "SELECT * FROM test2", []),
          queryClient(client, "SELECT * FROM \"Test3\"", [])
        ], function(err, results) {
          results[0].rows.length.should.equal(0);
          results[1].rows.length.should.equal(0);
          results[2].rows.length.should.equal(0);

          release();
          done();
        });
      });
    });
  });

  it('should retain schema_migrations', function(done) {
    pg.connect(connectionString, function(err, client, release) {
      if (err) return done(err);

      databaseCleaner.clean(client, function() {
        client.query("SELECT * FROM schema_migrations", function(err, result) {
          result.rows.length.should.equal(1);

          release();
          done();
        });
      });
    });
  });


  describe('truncation strategy', function() {
    before(function() {
      var config = { postgresql: { strategy: 'truncation', skipTables: [] } };

      databaseCleaner = new DatabaseCleaner('postgresql', config);
    });

    it('should truncate all not skippedTables records', function(done) {
      pg.connect(connectionString, function(err, client, release) {
        if (err) return done(err);

        databaseCleaner.clean(client, function() {
          async.parallel([
            queryClient(client, "SELECT * FROM test1", []),
            queryClient(client, "SELECT * FROM test2", [])
          ], function(err, results) {
            results[0].rows.length.should.equal(0);
            results[1].rows.length.should.equal(0);

            release();
            done();
          });
        });
      });
    });
  });
});

describe('pg empty', function() {
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
        done();
        _done();
      });
    });
  });

  it('should not struck if db is empty', function(done) {
    _done = done;

    pg.connect(connectionString, function(err, client, done) {
      databaseCleaner.clean(client, function() {
        done();
        _done();
      });
    });
  });
});
