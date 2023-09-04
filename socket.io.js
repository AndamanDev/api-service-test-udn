const EVENTS = require('./events.json')
const helpers = require('./helpers')
const _ = require('lodash')
const rfs = require('rotating-file-stream')
const pino = require('pino')
const path = require('path')

const accessLogStream = rfs.createStream('wss-access.log', {
  size: '10M',
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'logs'),
})

const logger = pino(
  {
    timestamp: () => `,"time":"${helpers.currentDateTime()}"`,
  },
  accessLogStream
)

let initClock = false

module.exports = (server) => {
  const io = require('socket.io')(server, { path: '/wss' })

  io.on('connection', (socket) => {
    // send data
    socket.on(EVENTS.SEND_DATA, (data) => {
      const ip = helpers.getClientIp(socket)
      const receiveEvent = _.get(data, 'receiveEvent', EVENTS.RECEIVE_DATA)
      const updatedData = _.merge(data, { ipAddress: ip })
      // save log file
      logger.info({ event: EVENTS.SEND_DATA, updatedData })
      // send data to client
      socket.broadcast.emit(receiveEvent, updatedData)
    })

    Object.keys(EVENTS).map((k) => {
      socket.on(EVENTS[k], (data) => {
        const ip = helpers.getClientIp(socket)
        const updatedData = _.merge(data, { ipAddress: ip })
        // save log file
        logger.info({ event: EVENTS[k], updatedData })

        socket.broadcast.emit(EVENTS[k], updatedData)
      })
    })

    // send current date time
    if (!initClock) {
      initClock = true
      helpers.clock.init(socket)
    }

    socket.on('disconnect', () => {
      io.emit('user disconnected')
    })
  })
}
