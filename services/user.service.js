const db = require('../config/db').queue
const _ = require('lodash')

class UserService {
  constructor() {}

  findByToken(token) {
    return db.raw('SELECT `user`.* FROM `user` WHERE `user`.auth_key = ? OR `user`.access_token = ?', [token, token])
  }

  findLastNhsoToken() {
    return db.select('*').from('tbl_nhso_token').orderBy('created_at', 'desc').first()
  }

  findByUsernameOrEmail(username, email) {
    return db
      .select('user.*', 'profile.*')
      .from('user')
      .innerJoin('profile', 'user.id', 'profile.user_id')
      .where({ username: username })
      .orWhere({ email: email })
      .first()
  }

  findById(userId) {
    return db
      .select('user.*', 'profile.*')
      .from('user')
      .innerJoin('profile', 'user.id', 'profile.user_id')
      .where({ id: userId })
      .first()
  }

  /**
   * อัพเดทรายการ
   * @param data
   * @param condition
   * @return {Promise<*|void>}
   */
  async update(data, condition = {}) {
    try {
      const defaultCondition = {
        id: _.get(data, 'id'),
      }
      const conditions = _.merge(defaultCondition, condition)
      const updated = await db('user').where(conditions).update(data)
      return updated[0]
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

module.exports = UserService
