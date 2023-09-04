const dbQueue = require('./mysql')
const mssql = require('./mssql')

module.exports = {
  queue: dbQueue,
  mssql: mssql,
}
