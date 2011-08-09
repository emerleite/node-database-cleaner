var testCase = require('nodeunit').testCase,
    DatabaseCleaner = require('lib/database-cleaner'),
    databaseCleaner = new DatabaseCleaner('mysql');
    
var mysql = require('mysql'), 
    Client = mysql.Client,
    client = new Client();

module.exports = testCase({
  setUp: function (callback) {
    client.user = 'root';
    client.password = '';
    client.query('CREATE DATABASE database_cleaner', function(err) {
      if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
         throw err;
      }
    });

    client.useDatabase('database_cleaner');

    client.query('CREATE TABLE test1 (id INTEGER NOT NULL AUTO_INCREMENT, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', function() {
      client.query('CREATE TABLE test2 (id INTEGER NOT NULL AUTO_INCREMENT, title VARCHAR(255) NOT NULL, PRIMARY KEY(id));', function() {
        client.query('INSERT INTO test1(title) VALUES(?)', ["foobar"], function() {
          client.query('INSERT INTO test2(title) VALUES(?)', ["foobar"], function() {
            callback();
          });
        });
      });
    });
  },
  tearDown: function (callback) {
    client.query("DROP TABLE test1", function() {
      client.query("DROP TABLE test2", function() {
        callback();
      });
    });
  },
  'should delete all records': function(test) {
    databaseCleaner.clean(client, function() {
      client.query("SELECT * FROM test1", function(err, result_test1) {
        client.query("SELECT * FROM test2", function(err, result_test2) {
          test.equal(result_test1.length, 0);
          test.equal(result_test2.length, 0);
          test.done();
        });
      });
    });
  }
});
