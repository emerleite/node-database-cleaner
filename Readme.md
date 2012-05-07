[![Build Status](https://secure.travis-ci.org/emerleite/node-database-cleaner.png)](http://travis-ci.org/emerleite/node-database-cleaner)

Node.js Database Cleaner
========================
The simplest way to clean your database. Removes all data. Starting only with mongodb, but will support mainstream databases.

Say you're doing test cases. How can you clean up your data after each
test run? With Database Cleaner you can simply do it with one line of code.

Supported Databases
-------------------
* MongoDB
* Redis
* CouchDB
* MySQL

Dependencies
------------

### Runtime
* Node 0.4.x+
* node-mongodb-native (a.k.a mongodb)
* redis
* cradle for couchdb (<http://cloudhead.io/cradle>)
* mysql server

### Development/Tests
* mocha
* should
* hredis
* redis
* cradle
* mysql

Instalation
-----------
```shell
$ npm install database-cleaner 
```

Usage
------
```javascript
var DatabaseCleaner = require('database-cleaner');
var databaseCleaner = new DatabaseCleaner(type); //type = 'mongodb|redis|couchdb'

databaseCleaner.clean(database, callback);
```

### Examples
Take look at test folder to see how it works.

Look at examples dir.

Running tests
-------------
There is some ways to run tests:

```shell
$ mocha test # you need mocha globaly installed. `npm install -g mocha`
$ npm test
```

For tests you need each database running (mongodb, redis, couchdb, mysql)
Or run once. Ex: `mocha test/redis.test.js`

You can also run tests using local mocha. ./node_modules/mocha/bin/mocha

To-Do
-----
* see (<https://github.com/emerleite/node-database-cleaner/issues>)

Author
------

* Emerson Macedo (<http://codificando.com/> and <http://nodecasts.org>)

License:
--------

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
