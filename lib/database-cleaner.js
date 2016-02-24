var DatabaseCleaner = module.exports = function(type, config) {
  var cleaner = {};

  if (!config) {
    try {
      config = require("../../../config/cleaner-config.js");
    } catch(e) {
      config = require("../config/cleaner-config.js");
    }
  }

  cleaner['mongodb'] = function(db, callback) {
    db.collections( function (skip, collections) {
      var count = collections.length;
      if (count < 1) return callback();

      collections.forEach(function (collection) {
        collection.drop(function () {
          if (--count <= 0 && callback) {
            callback();
          }
        });
      });
    });
  };

  cleaner['redis'] = function(db, callback) {
    db.flushdb(callback);
  };

  cleaner['couchdb'] = function(db, callback) {
    db.destroy(function (err, res) {
      if (err) return callback(err);

      db.create(callback);
    });
  };

  cleaner['mysql'] = function(db, callback) {
    db.query('show tables', function(err, tables) {
      if (err) return callback(err);

      var count  = 0;
      var length = tables.length;
      var tableName = 'Tables_in_' + db.config.database;
      var skippedTables = config.mysql.skipTables;

      if(length === 0) {
        // The database is empty
        return callback();
      }

      tables.forEach(function(table) {
        if (skippedTables.indexOf(table[tableName]) === -1) {
          db.query("DELETE FROM " + table[tableName], function() {
            if(err) {
              return callback(err);
            }

            count++;
            if (count >= length) {
              callback();
            }
          });
        } else {
          count++;
          if (count >= length) {
            callback();
          }
        }
      });
    });
  };

  cleaner['postgresql'] = function(db, callback) {
    db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';", function(err, tables) {
      if (err) return callback(err);

      var count  = 0;
      var length = tables.rows.length;
      var skippedTables = config.postgresql.skipTables;

      if(length === 0) {
        // The database is empty
        return callback();
      }

      tables.rows.forEach(function(table) {
        if (skippedTables.indexOf(table['table_name']) === -1) {
          db.query("DELETE FROM " + "\"" + table['table_name'] + "\"", function() {
            count++;

            if (count >= length) {
              callback();
            }
          });
        } else {
          count++;
          if (count >= length) {
            callback();
          }
        }
      });
    });
  };

  cleaner['elasticsearch'] = function(db, callback) {
    db.indices.delete({index: "*"}, function(err, response) {
      callback.apply();
    });
  };

  this.clean = function (db, callback) {
    cleaner[type](db, callback);
  };
};
