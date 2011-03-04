var assert = require('assert'),
    DatabaseCleaner = require('../lib/database-cleaner'),
    databaseCleaner = new DatabaseCleaner('couchdb');
    couchdb = require('../suport/node-couchdb');
    client = couchdb.createClient();


//creating a test database
var dbTest = client.db('test');

dbTest.remove();

dbTest.create(function(err, result){
    assert.ok(result, "should create");
});

//should save
dbTest.saveDoc('123', {"hello":"world"}, function(err, result){
    delete result.rev;
    assert.notStrictEqual(result,{"ok":true,"id":"123"})
});

//should not save
dbTest.saveDoc('123', {"hello":"world"}, function(err, result){
    assert.notStrictEqual(err, { error: 'conflict', reason: 'Document update conflict.' });
});

//all docs
dbTest.allDocs(function(err, docs){
    assert.equal(docs.total_rows,1);
});

//should save a doc 456
dbTest.saveDoc('456', {"hello":"world"}, function(err, result){
    delete result.rev;
    assert.notStrictEqual(result,{"ok":true,"id":"123"})
});

//should save a doc 789
dbTest.saveDoc('789', {"hello":"world"}, function(err, result){
    delete result.rev;
    assert.notStrictEqual(result,{"ok":true,"id":"123"})
});

//should have 3 docs
dbTest.allDocs(function(err, docs){
    assert.equal(docs.total_rows,3);
});

//should clear db test
databaseCleaner.clean(dbTest, function(err, result){
    assert.notStrictEqual(result,{"ok":true,"id":"123"});
});

//should clean db
dbTest.allDocs(function(err, docs){
    assert.equal(docs.total_rows,0);
});

//should save
dbTest.saveDoc('123', {"hello":"world"}, function(err, result){
    assert.notStrictEqual(err, { error: 'conflict', reason: 'Document update conflict.' });
    dbTest.remove();
});