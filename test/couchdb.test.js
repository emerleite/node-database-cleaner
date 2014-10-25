var should = require('should'),
    DatabaseCleaner = require('../lib/database-cleaner'),
    databaseCleaner = new DatabaseCleaner('couchdb'),
    cradle = require('cradle'),
    db = new(cradle.Connection)(process.env.COUCHDB_HOST || '127.0.0.1').database('database_cleaner');;

describe('couchdb', function() {
  beforeEach(function(done) {
    db.create();
    db.save({nodejs: 'is', realy: 'awesome'}, done);
  });

  it('should have 0 docs after drop and create', function(done) {
    databaseCleaner.clean(db, function() {
      db.all(function(err, res) {
        res.total_rows.should.equal(0);
        done();
      });
    });
  });
});
