var should = require('should'),
    DatabaseCleaner = require('../lib/database-cleaner'),
    databaseCleaner = new DatabaseCleaner('redis');
var redis = require('redis');

var redisHost = process.env.REDIS_HOST || 'localhost';

describe('redis', function() {
  var client = null;

  beforeEach(function(done) {
    client = redis.createClient(6379, redisHost, {});
    client.select(1);
    client.mset("name", "emerson", "email", "emerleite@gmail.com", "site", "codificando.com", "github", "github.com/emerleite", done);
  });

  afterEach(function() {
    client.end();
    client = null;
  });

  it('should delete all keys', function() {
    databaseCleaner.clean(client, function () {
      client.keys('*', function (err, results) {
        results.length.should.equal(0);
        done()
      });
    });
  });
});
