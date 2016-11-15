1.2.0 / 2016-11-15
==================

  * Support pooled MySQL connections (Rob Wells)
  * Fix: Do not drop VIEWS (Matteo Ferrando)

1.1.0 / 2016-08-16
==================

  * Support for specifying postgres schema (Ian Zabel)

1.0.0 / 2016-06-25
==================

  * Sequence reset for postgres truncation (Matheus Pedroso)
  * Skip system.indexes when delete MongoDB collections (Kostas Bariotis)

0.13.0 / 2016-03-25
==================

  * Cleanup now have two strategy options. 'delete' (default) or 'truncate'. (yads)

0.12.0 / 2016-02-25
==================

  * Elastic Search support (luizgpsantos)
  * Removed version 0.8.x support (emerleite)
  * Handle errors and pass it to the callback (gabceb)

0.11.0 / 2016-01-13
==================

  * Allow to pass the config data on initialize (gabceb)
  * Fix: mysql/postgesql stuck if no table to clean. (Amoki)

0.10.1 / 2015-10-09
==================

  * Fix: Config can be relative to executing dir. Closes #31 (knappe)

0.10.0 / 2015-07-20
==================

  * Allow skip tables during tests. Supports MySQL and Postgres

0.9.2 / 2015-07-15
==================

  * MySQL cleanner. Issue #25
  * Postgres: quote database table name when delete data, fixed an issue when table name is capitalized. Pull Request #23

0.9.1 / 2014-01-24
==================

  * Moved all dependencies to devDependencies because you only need than on test environment. Closes issues #20 and #21.

0.9.0 / 2014-10-25
==================

  * Postgres support
  * Added POSTGRES_HOST, MYSQL_HOST and COUCHDB_HOST to allow use another ip than localhost when testing.

0.8.0 / 2014-10-03
==================

  * DatabaseCleanner global leak fixed.
  * Supports only node >= 0.8.0

0.7.0 / 2011-12-18
==================
  * Remove system.indexes during cleanner - Issue #13 (mongodb)
  * Invoke callback even if empty collection - Bug #14 and #15 (mongodb)
  * Mongodb usage example at examples dir
  * Updated mongodb, cradle, mysql and redis pkg versions

0.6.1 / 2011-12-18
==================
  * rewrited all tests using mocha
  * removed nodeunit dependency (not used anymore)

0.6.0 / 2011-11-05
==================
  * Node.JS 0.6.0 compatibility - Issue #10
  * Fixed nodeunit dependency version
  * Using database 1 for redis tests to not screw up user database
  * Added a test script to not require user install nodeunit globaly

0.5.0 / 2011-09-28
==================
  * Removed mongoose dependency and using only mongodb native driver
  * Fixed mongodb driver update - Issue #9

0.4.0 / 2011-08-08
==================

  * Mysql Support (Dai Akatsuka - https://github.com/dakatsuka)

0.3.3 / 2011-05-10
==================

  * Added dependencies and dev dependencies

0.3.2 / 2011-03-09
==================

  * Using index.js as main in package.json. This is a standard in npm

0.3.1 / 2011-03-09
==================

  * Updated package.json to work with npm >= 0.3 (Zach Smith - https://github.com/xcoderzach)

0.3.0 / 2011-03-04
==================

  * Added couchdb support usign cradle (http://cloudhead.io/cradle)

0.2.0 / 2011-03-02
==================

  * Added redis support
  * Changed the API
  * Updated documentation with the new API sintax

0.1.1 / 2011-02-09
==================

  * Added node-mongodb-native as a project dependency

0.1.0 / 2011-02-09
==================

  * Support MongoDB
  * Clean all databases but system.indexes
  * Basic test structure
  * Initial documentation
