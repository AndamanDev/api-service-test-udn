const UserService = require('../services/user.service')
const yup = require('yup')
const _ = require('lodash')
const utils = require('../utils')
const moment = require('moment')
const bcrypt = require('bcryptjs')
moment.locale('th')

/**
 * @method POST
 * @param {String} username
 * @param {String} password
 */
exports.login = async (req, res) => {
  try {
    // validate data
    let schema = yup.object().shape({
      username: yup.string().min(3).required(),
      password: yup.string().min(6).required(),
    })
    await schema.validate(req.body)

    const UserServiceModel = new UserService()

    let user = await UserServiceModel.findByUsernameOrEmail(req.body.username, req.body.username)
    req.assert(user, 400, 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง.')

    const passwordMatches = bcrypt.compareSync(req.body.password, user.password_hash)
    req.assert(passwordMatches, 400, 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง.')

    if (
      user.access_token_expired_at &&
      Number(user.access_token_expired_at) > Number(moment().format('X')) &&
      user.access_token
    ) {
      await UserServiceModel.update({
        id: user.id,
        last_login_at: moment().format('X'),
      })
      res.success({
        user: _.pick(user, ['id', 'email', 'name']),
        access_token: user.access_token,
        expires_in: user.access_token_expired_at,
        token_type: process.env.TOKEN_TYPE,
      })
    } else {
      user = _.pick(user, ['id', 'email', 'name'])
      let payload = {
        user: user,
        name: user.name,
        jti: user.id,
      }
      const accessToken = utils.generateAccessToken(payload, {
        audience: String(user.id),
        subject: String(user.id),
      })
      const decoded = utils.verifyToken(accessToken)
      await UserServiceModel.update({
        id: user.id,
        last_login_at: moment().format('X'),
        access_token_expired_at: decoded.exp,
        access_token: accessToken,
      })

      res.success({
        user: user,
        access_token: accessToken,
        expires_in: decoded.exp,
        token_type: process.env.TOKEN_TYPE,
      })
    }
  } catch (error) {
    res.error(error)
  }
}
