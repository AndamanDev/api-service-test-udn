const soap = require('soap')
const UserService = require('../services/user.service')
const KioskService = require('../services/kiosk.service')
const _ = require('lodash')
const utils = require('../utils')

/**
 * ตรวจสอบสิทธิ์ สปสช /v1/kiosk/pt-right/:cid
 * @method GET
 * @param {Number} cid
 * @returns {Object}
 */
exports.getPatientRight = async (req, res) => {
  try {
    const UserServiceModel = new UserService()
    const token = await UserServiceModel.findLastNhsoToken()
    req.assert(token, 400, 'invalid token')
    const args = {
      user_person_id: token.token_cid,
      smctoken: token.token_key,
      person_id: String(req.params.cid).replace(/ /g, ''),
    }
    const result = await new Promise((resolve) => {
      resolve(
        soap
          .createClientAsync(process.env.SOAP_URL)
          .then((client) => {
            return client.searchCurrentByPIDAsync(args)
          })
          .then((result) => {
            return result[0].return
          })
      )
    })
    req.assert(result, 404, 'ไม่พบข้อมูลสิทธิการรักษา')
    if (_.get(result, 'ws_status') === 'NHSO-00003') {
      req.throw(400, _.get(result, 'ws_status_desc', 'Token expire.'))
    } else if (_.isEmpty(result.fname)) {
      req.throw(400, 'Not found in NHSO.')
    } else if (_.isEmpty(result.maininscl) || _.isEmpty(result.maininscl_name)) {
      req.throw(400, 'ไม่พบข้อมูลสิทธิการรักษา')
    }
    res.success(result)
  } catch (error) {
    res.error(error)
  }
}

/**
 * ค้นหาผู้ป่วยห้องจ่ายยา
 * @param q
 * @returns {Object}
 */
exports.getPatientPharmacy = async (req, res) => {
  try {
    req.assert(req.params.q, 400, 'invalid params.')

    const KioskServiceModel = new KioskService()
    const patient = await KioskServiceModel.findPatientPharmacy(req.params.q)
    req.assert(patient, 404, 'ไม่พบข้อมูลผู้ป่วย.')

    res.success(utils.trimValue(patient))
  } catch (error) {
    res.error(error)
  }
}
