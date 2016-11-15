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

      var skippedCollections = config.mongodb.skipCollections || [];

      collections.forEach(function (collection) {
        if(skippedCollections.indexOf(collection.collectionName) > -1){
          if (--count <= 0 && callback) {
            callback();
          } else {
            return;
          }
        } else {
          collection.drop(function () {
            if (--count <= 0 && callback) {
              callback();
            }
          });
        }
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

      var database = db.config.connectionConfig ?
        db.config.connectionConfig.database : db.config.database;

      var count  = 0;
      var length = tables.length;
      var tableName = 'Tables_in_' + database;
      var skippedTables = config.mysql.skipTables;
      var strategy = config.mysql.strategy || 'deletion';
      if (strategy !== 'deletion' && strategy !== 'truncation') {
        return callback(new Error('Invalid deletion strategy: ' + strategy));
      }

      if(length === 0) {
        // The database is empty
        return callback();
      }

      tables.forEach(function(table) {
        if (skippedTables.indexOf(table[tableName]) === -1) {
          var statement = strategy === 'deletion' ? 'DELETE FROM ' : 'TRUNCATE TABLE '
          db.query(statement + table[tableName], function(err) {
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
    var schema = config.postgresql.schema || 'public';
    var schemaPrefix = '"' + schema + '".';

    db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = '" + schema + "' AND table_type = 'BASE TABLE';", function(err, tables) {
      if (err) return callback(err);

      var count  = 0;
      var length = tables.rows.length;
      var skippedTables = config.postgresql.skipTables;
      var strategy = config.postgresql.strategy || 'deletion';
      if (strategy !== 'deletion' && strategy !== 'truncation') {
        return callback(new Error('Invalid deletion strategy: ' + strategy));
      }

      if(length === 0) {
        // The database is empty
        return callback();
      }

      if (strategy === 'deletion') {
        tables.rows.forEach(function(table) {
          if (skippedTables.indexOf(table['table_name']) === -1) {
            db.query("DELETE FROM " + schemaPrefix + "\"" + table['table_name'] + "\"", function() {
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
      } else if (strategy === 'truncation') {
        var tableExpression = tables.rows
                                .filter(function(table) {
                                  return skippedTables.indexOf(table['table_name']) === -1;
                                }).map(function(table) {
                                  return schemaPrefix + '"' + table['table_name'] + '"';
                                }).join(', ');

        // no tables to truncate
        if (!tableExpression) {
          return callback();
        }

        db.query('TRUNCATE TABLE ' + tableExpression + ' RESTART IDENTITY', function(err) {
          if(err) {
            return callback(err);
          }
          callback();
        });
      }

    });
  };

  cleaner['elasticsearch'] = function(db, callback) {
    db.indices.delete({index: "*"}, function(err, response) {
      callback.apply();
    });
  };

  cleaner['sqlite'] = function(db, callback) {
    var skippedTables = config.sqlite.skipTables;

		return db.all("SELECT name FROM sqlite_master WHERE type='table'", function(err, rows) {
      if (err) return callback(err);

      var tables = rows.map(function(row) {
        return row.name;
      });

      var num_expected = 0;
      var num_returned = 0;
      var responded    = false;

      function maybeRespond(err) {
        if (responded) {
          return;
        }

        num_returned++;
        if (err || num_returned === num_expected) {
          responded = true;
          callback(err);
        }
      }

      tables.forEach(function(table) {
        if (table === 'sqlite_sequence') return;
        if (skippedTables.indexOf(table) !== -1) return;
        num_expected++;
        db.run("DELETE FROM " + table, maybeRespond);
      });

      if (!num_expected) return callback(); // when there is nothing to clear
    });
  };


  this.clean = function (db, callback) {
    cleaner[type](db, callback);
  };
};
