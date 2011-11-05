var testCase = require('nodeunit').testCase,
    DatabaseCleaner = require('../lib/database-cleaner'),
    databaseCleaner = new DatabaseCleaner('redis');
var redis = require('redis');

module.exports = testCase({
  setUp: function (callback) {
    this.client = redis.createClient();
    this.client.select("1");
    this.client.mset("name", "emerson", "email", "emerleite@gmail.com", "site", "codificando.com", "github", "github.com/emerleite", function (err, results) {
      callback();
    });
  },
  tearDown: function (callback) {
    this.client.end();
    this.client = null;
    callback();
  },
  'should delete all keys': function(test) {
    var client = this.client;
    databaseCleaner.clean(client, function () {
      client.keys('*', function (err, results) {
        test.equal(results.length, 0);
        test.done();
      });
    });
  }
});

