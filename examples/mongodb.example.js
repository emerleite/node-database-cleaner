var DatabaseCleaner = require('../lib/database-cleaner'); 
var databaseCleaner = new DatabaseCleaner('mongodb');

var connect = require('mongodb').connect;

connect('mongodb://localhost/database_cleaner_example', function(err, db) {
  databaseCleaner.clean(db, function() {
    console.log('done');
    db.close();
  });
});


