const knex = require('knex')

/**
 * Connect to Mysql.
 */
const db = knex({
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
  },
  pool: { min: 0, max: 10 },
  asyncStackTraces: true,
  useNullAsDefault: true,
})

module.exports = db
