const http = require('http')
const app = require('./app')
const server = http.createServer(app)
const devMode = process.env.NODE_ENV === 'development'

// env
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000

/**
 * Socket io
 */
require('./socket.io')(server)

server.listen(port, host, () => {
  if (devMode) {
    console.log(`app listening at http://${host}:${port}`)
  }
})
