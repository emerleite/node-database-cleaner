var DatabaseCleaner = module.exports = function(type) {
  var cleaner = {};

  cleaner['mongodb'] = function(db, callback) {
    db.collections( function (skip, collections) {
      var count = collections.length;
      if (count < 1) { return callback.apply(); }

      collections.forEach(function (collection) {
        collection.drop(function () {
          if (--count <= 0 && callback) {
            callback.apply();
          }
        });
      });
    });
  };
  
  cleaner['redis'] = function(db, callback) {
    db.flushdb(function(err, results) {
      callback.apply();
    });
  };

  cleaner['couchdb'] = function(db, callback) {
    db.destroy(function (err, res) {
      db.create(function (err, res) {
        callback.apply();
      });
    });
  };

  cleaner['mysql'] = function(db, callback) {
    db.query('show tables', function(err, tables) {
      var count  = 0;
      var length = tables.length;

      tables.forEach(function(table) {
        if (table['Tables_in_database_cleaner'] != 'schema_migrations') {
          db.query("DELETE FROM " + table['Tables_in_database_cleaner'], function() {
            count++;
            if (count >= length) {
              callback.apply();
            }
          });
        } else {
          count++;
          if (count >= length) {
            callback.apply();
          }
        }
      });
    });
  };

  cleaner['postgresql'] = function(db, callback) {
    db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';", function(err, tables) {
      var count  = 0;
      var length = tables.rows.length;

      tables.rows.forEach(function(table) {
        if (table['table_name'] != 'schema_migrations') {
          db.query("DELETE FROM " + table['table_name'], function() {
            count++;
            if (count >= length) {
              callback.apply();
            }
          });
        } else {
          count++;
          if (count >= length) {
            callback.apply();
          }
        }
      });
    });
  };

  this.clean = function (db, callback) {
    cleaner[type](db, callback);
  };
};
