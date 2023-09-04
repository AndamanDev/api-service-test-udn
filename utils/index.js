const _ = require('lodash')
const jwt = require('jsonwebtoken')

const trimValue = (data, skipAttributes = []) => {
  if (_.isEmpty(data)) {
    if (typeof data === 'object') {
      return data
    } else if (typeof data === 'string') {
      return ''
    } else {
      return data
    }
  }
  if (Array.isArray(data)) {
    const newArray = data.map((currentValue, index, arr) => {
      if (typeof currentValue === 'object') {
        return trimValue(currentValue, skipAttributes)
      } else if (typeof currentValue === 'string') {
        return currentValue ? currentValue.replace(/\s+/g, '') : currentValue
      } else {
        return currentValue ? currentValue.replace(/\s+/g, '') : currentValue
      }
    })
    return newArray
  } else if (typeof data === 'object') {
    const keys = Object.keys(data)
    if (!keys.length) return data
    const newObject = {}
    keys.map((k) => {
      if (skipAttributes.includes(k)) {
        newObject[k] = data[k]
      } else if (data[k] && typeof data[k] === 'string') {
        if (data[k]) {
          const newData = trimValue(
            data[k].split(' ').filter((arr) => !_.isEmpty(arr)),
            skipAttributes
          )
          newObject[k] = newData.join(' ')
        } else {
          newObject[k] = data[k]
        }
      } else if (data[k] && typeof data[k] === 'object') {
        newObject[k] = trimValue(data[k], skipAttributes)
      } else {
        newObject[k] = data[k]
      }
    })
    return newObject
  } else {
    return data.replace(/\s+/g, '')
  }
}

const generateAccessToken = (payload, options = {}) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    Object.assign(
      {
        algorithm: process.env.JWT_ALGORITHM,
        notBefore: process.env.JWT_NOTBEFORE,
        expiresIn: process.env.JWT_EXPIRESIN, // 60 * 60 * 24, // '10h',
        // audience: String(client.clientId).toLowerCase(),
        issuer: process.env.JWT_ISSUER,
        // subject: String(user._id).toLowerCase(),
      },
      options
    )
  )
}

const verifyToken = (accessToken) => {
  return jwt.verify(accessToken, process.env.JWT_SECRET)
}

module.exports = {
  trimValue,
  generateAccessToken,
  verifyToken,
}
