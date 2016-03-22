module.exports = {
  mysql: {
    skipTables: ['schema_migrations']
  },

  postgresql: {
    skipTables: ['schema_migrations']
  },

  mongodb: {
      skipTables: ['schema_migrations']
  }
}
