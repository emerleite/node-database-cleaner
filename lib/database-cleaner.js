module.exports = DatabaseCleaner = function(type) {
  var type = type;
  var cleaner = {};

  cleaner['mongodb'] = function(db, callback) {
    db.collections( function (skip, collections) {
      var count = collections.length;
      collections.forEach(function (collection) {
        if (collection.collectionName != 'system.indexes') {
          collection.remove({}, function () {
            count--;
            if (count <= 0 && callback) {
              callback.apply();
            }
          });
        } else {
          count--;
          if (count <= 0 && callback) {
            callback.apply();
          }
        }
      });
    });
  };
  
  cleaner['redis'] = function(db, callback) {
    db.flushdb(function(err, results) {
      callback.apply();
    });
  };
  
  cleaner['couchdb'] = function(db, callback) {
    /**
    ** @link https://github.com/felixge/node-couchdb
    **/
    var client = db.client;
    var dbName = db.name;
    db.remove();
    var newDb = client.db(dbName);
    db.create(function(err, result){
        if(result){
            this.db = newDb;
            //callback.apply(this, arguments);
            callback(err, result);
        };
    })
  };

  this.clean = function (db, callback) {
    cleaner[type](db, callback);
  };
};
