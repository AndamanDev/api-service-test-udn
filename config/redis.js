'use strict'

const redis = require('redis')

let redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})

/* redisClient.on('error', function (error) {
  console.error(error)
}) */

module.exports = redisClient
