module.exports = {
  mysql: {
    skipTables: ['schema_migrations']
  },

  postgresql: {
    skipTables: ['schema_migrations']
  },

  mongodb: {
      skipCollections: ['schema_migrations']
  }
}
