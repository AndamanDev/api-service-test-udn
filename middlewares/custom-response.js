'use strict'
const devMode = process.env.NODE_ENV === 'development'

module.exports = () => {
  return function (req, res, next) {
    res.success = (data = '', statusCode = 200) => {
      res.status(statusCode || 200).send({
        statusCode: statusCode,
        success: true,
        message: 'ok',
        data: data,
      })
    }

    res.error = (err) => {
      if (devMode) {
        console.log(err.stack)
      }
      let statusCode = err.status || 500
      res.status(statusCode)
      res.send({
        statusCode: statusCode,
        success: false,
        name: String(err.name).replace('Error', ''),
        message: err.message,
      })
    }

    next()
  }
}
