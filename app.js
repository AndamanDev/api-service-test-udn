const devMode = process.env.NODE_ENV === 'development'
require('dotenv').config({ path: devMode ? './.env' : './.env.production' })

const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const compression = require('compression')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
const rfs = require('rotating-file-stream')
const RateLimit = require('express-rate-limit')
const redis = require('./config/redis')
const RedisStore = require('rate-limit-redis')
const createError = require('http-errors')
const httpAssert = require('http-assert')
const moment = require('moment')
const customReaponse = require('./middlewares/custom-response')
const passport = require('passport')
moment.locale('th')

// error
const throwError = (...args) => {
  throw createError(...args)
}

// routes
const appRoutes = require('./routes')

// middlewares
app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// compress all responses
app.use(compression())

app.use(helmet())

// create a write stream (in append mode)
// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' })
// create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  size: '10M',
  path: path.join(__dirname, 'logs'),
})
// setup the logger
morgan.token('date', (req, res) => {
  return moment().format('ddd, DD MMM YYYY HH:mm:ss')
})
app.use(
  morgan(
    ':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
    { stream: accessLogStream }
  )
)

/**
 * Rate Limit
 */
const limiter = new RateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  delayMs: 0, // disable delaying - full speed until the max limit is reached
})

//  apply to all requests
app.use(limiter)

// cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-TOKEN, X-ACCESS-TOKEN'
  )
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return res.status(200).json({})
  }
  req.assert = httpAssert
  req.throw = throwError
  next()
})

/**
 * Passport is authentication
 */
app.use(passport.initialize())
app.use(passport.session())
require('./config/passport')

// custom response
app.use(customReaponse())

// routes
app.get('/', (req, res) => res.json({ message: 'RESTful API' }))
// Routes which should handle requests
app.use(appRoutes)

// error handler
app.use((req, res, next) => {
  const error = new Error('Not found')
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
  let statusCode = error.status || 500
  res.status(statusCode)
  res.json({
    statusCode: statusCode,
    name: String(error.name).replace('Error', ''),
    message: error.message,
  })
})

module.exports = app
