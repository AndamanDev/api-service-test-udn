const UserService = require('../services/user.service')
const utils = require('../utils')

module.exports = async (req, res, next) => {
  try {
    const xToken = req.headers['x-token'] || req.headers['x-access-token']
    const accessToken = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]

    let user = null
    if (accessToken) {
      const decoded = utils.verifyToken(accessToken)
      user = decoded.user
    } else if (xToken) {
      const UserServiceModel = new UserService()
      user = await UserServiceModel.findByToken(xToken)
    }
    req.assert(user, 401)
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}
