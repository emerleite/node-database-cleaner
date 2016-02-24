var should = require('should'),
    DatabaseCleaner = require('../lib/database-cleaner'),
    databaseCleaner = new DatabaseCleaner('elasticsearch');
var elasticsearch = require('elasticsearch');

var elasticsearchHost = process.env.ELASTICSEARCH_HOST || 'localhost';
var elasticsearchPort = process.env.ELASTICSEARCH_PORT || 9200;

describe('elasticsearch', function() {
  var client = null;

  beforeEach(function(done) {
    client = new elasticsearch.Client({
      host: {
        host: elasticsearchHost,
        port: elasticsearchPort
      }
    });
    client.index({
      index: 'myindex',
      type: 'mytype',
      id: '1',
      body: {
        title: 'Test 1'
      }
    }, done);
  });

  it('should delete all indices', function(done) {

    databaseCleaner.clean(client, function () {
      client.search({index: '*'}, function (error, response) {
        response.hits.total.should.be.equal(0);
        done();
      });
    });

  });

});
