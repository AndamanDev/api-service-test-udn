const moment = require('moment')
moment.locale('th')

const getClientIp = (socket) => {
  return socket.handshake.headers['x-forwarded-for']
    ? socket.handshake.headers['x-forwarded-for'].split(/\s*,\s*/)[0]
    : socket.request.connection.remoteAddress
}

const currentDateTime = (format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment().format(format)
}

const CLOCK = 'clock'

/**
 * clock
 */
let intervalSecond = null
let intervalMinute = null
let intervalHour = null

const clock = {
  init: function (socket) {
    const self = this
    if (!socket) return
    let hour = '00'
    let minute = '00'
    let second = '00'
    if (intervalSecond) {
      clearInterval(intervalSecond)
    }
    if (intervalMinute) {
      clearInterval(intervalMinute)
    }
    if (intervalHour) {
      clearInterval(intervalHour)
    }
    intervalSecond = setInterval(function () {
      const b = parseFloat(self.getDateFormat('ss'))
      second = (b < 10 ? '0' : '') + b
    }, 1e3)
    intervalMinute = setInterval(function () {
      const c = parseFloat(self.getDateFormat('mm'))
      minute = (c < 10 ? '0' : '') + c
      if (second === '00' || second === 0) {
        const d = self.getDateFormat('HH')
        const data = {
          current_time: `${new String(d)}:${minute}`,
          hour: new String(hour),
          minute: minute,
          second: second,
          current_date: self.getDateFormat('วันddddที่ DD MMMM ') + self.getYearThai(),
          today: self.getDateFormat(),
        }
        socket.broadcast.emit(CLOCK, data)
      }
    }, 1e3)
    intervalHour = setInterval(function () {
      const d = parseFloat(self.getDateFormat('HH'))
      hour = (d < 10 ? '0' : '') + d
    }, 1e3)
  },
  getDateFormat: function (format = 'YYYY-MM-DD HH:mm:ss') {
    return moment(this.getCurrentDate()).format(format)
  },
  getCurrentDate: function () {
    const date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok', hour12: false }).replace(/,/g, '')
    return new Date(date)
  },
  getYearThai: function () {
    return parseInt(moment(this.getCurrentDate()).format('YYYY')) + 543
  },
}

module.exports = {
  getClientIp,
  currentDateTime,
  clock,
}
