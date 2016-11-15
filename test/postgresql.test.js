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
        queryClient(client, 'CREATE SCHEMA other_schema', []),
        queryClient(client, 'CREATE TABLE other_schema.test1 (id SERIAL, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', []),
        queryClient(client, 'CREATE TABLE other_schema.test2 (id SERIAL, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', []),
        queryClient(client, 'CREATE TABLE test1 (id SERIAL, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', []),
        queryClient(client, 'CREATE TABLE test2 (id SERIAL, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', []),
        queryClient(client, 'CREATE TABLE "Test3" (id SERIAL, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', []),
        queryClient(client, 'CREATE TABLE schema_migrations (id SERIAL, version VARCHAR(255) NOT NULL, PRIMARY KEY(id));', []),
        queryClient(client, 'INSERT INTO other_schema.test1 (title) VALUES ($1);', ["foo"]),
        queryClient(client, 'INSERT INTO other_schema.test1 (title) VALUES ($1);', ["bar"]),
        queryClient(client, 'INSERT INTO other_schema.test2 (title) VALUES ($1);', ["foo"]),
        queryClient(client, 'INSERT INTO other_schema.test2 (title) VALUES ($1);', ["bar"]),
        queryClient(client, 'INSERT INTO test1 (title) VALUES ($1);', ["foo"]),
        queryClient(client, 'INSERT INTO test1 (title) VALUES ($1);', ["bar"]),
        queryClient(client, 'INSERT INTO test2 (title) VALUES ($1);', ["foo"]),
        queryClient(client, 'INSERT INTO test2 (title) VALUES ($1);', ["bar"]),
        queryClient(client, 'INSERT INTO "Test3" (title) VALUES ($1);', ["foobar"]),
        queryClient(client, 'INSERT INTO schema_migrations (version) VALUES ($1);', ["20150716190240"]),
        function(next) { release(); next(); },
      ], done);
    });
  });

  afterEach(function(done) {
    pg.connect(connectionString, function(err, client, release) {
      if (err) return done(err);

      async.parallel([
        queryClient(client, 'DROP SCHEMA other_schema CASCADE', []),
        queryClient(client, 'DROP TABLE test1 CASCADE', []),
        queryClient(client, 'DROP TABLE test2 CASCADE', []),
        queryClient(client, 'DROP TABLE "Test3" CASCADE', []),
        queryClient(client, 'DROP TABLE schema_migrations CASCADE', []),
        function(next) { release(); next(); },
      ], done);
    });
  });

  it('should delete all non skippedTable records in default schema', function(done) {
    pg.connect(connectionString, function(err, client, release) {
      if (err) return done(err);

      databaseCleaner.clean(client, function() {
        async.parallel([
          queryClient(client, "SELECT * FROM other_schema.test1", []),
          queryClient(client, "SELECT * FROM other_schema.test2", []),
          queryClient(client, "SELECT * FROM test1", []),
          queryClient(client, "SELECT * FROM test2", [])
        ], function(err, results) {
          results[0].rows.length.should.equal(2);
          results[1].rows.length.should.equal(2);
          results[2].rows.length.should.equal(0);
          results[3].rows.length.should.equal(0);

          release();
          done();
        });
      });
    });
  });

  describe('specifying a different schema', function() {
    before(function() {
      var config = { postgresql: { strategy: 'truncation', skipTables: [], schema: 'other_schema' } };

      databaseCleaner = new DatabaseCleaner('postgresql', config);
    });

    it('should delete all non skippedTable records in specified schema', function(done) {
      pg.connect(connectionString, function(err, client, release) {
        if (err) return done(err);

        databaseCleaner.clean(client, function() {
          async.parallel([
              queryClient(client, "SELECT * FROM other_schema.test1", []),
              queryClient(client, "SELECT * FROM other_schema.test2", []),
              queryClient(client, "SELECT * FROM test1", []),
              queryClient(client, "SELECT * FROM test2", [])
          ], function(err, results) {
            results[0].rows.length.should.equal(0);
            results[1].rows.length.should.equal(0);
            results[2].rows.length.should.equal(2);
            results[3].rows.length.should.equal(2);

            release();
            done();
          });
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
            queryClient(client, "SELECT * FROM test2", []),
            queryClient(client, "SELECT * FROM other_schema.test2", []),
            queryClient(client, "SELECT * FROM other_schema.test2", []),
            queryClient(client, "SELECT last_value FROM test1_id_seq", []),
            queryClient(client, "SELECT last_value FROM test2_id_seq", [])
          ], function(err, results) {
            results[0].rows.length.should.equal(0);
            results[1].rows.length.should.equal(0);
            results[2].rows.length.should.equal(2);
            results[3].rows.length.should.equal(2);
            results[4].rows[0].last_value.should.equal('1');
            results[5].rows[0].last_value.should.equal('1');

            release();
            done();
          });
        });
      });
    });

    it('should not try to truncate views', function(done) {
      pg.connect(connectionString, function(err, client, release) {
        if (err) return done(err);

        queryClient(client, 'CREATE VIEW public.test1_test2_view AS SELECT t1.id as t1, t2.id as t2, t1.title as t1_title, t2.title as t2_title FROM test1 t1, test2 t2;', [], function(err) {
          if (err) return done(err);

          databaseCleaner.clean(client, function(err) {
            if (err) return done(err);

            client.query("SELECT * FROM test1_test2_view", function(err, result) {
              if (err) return done(err);

              queryClient(client, 'DROP VIEW test1_test2_view;', [], function(err) {
                if (err) return done(err);

                release();
                done();
              });
            });
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
