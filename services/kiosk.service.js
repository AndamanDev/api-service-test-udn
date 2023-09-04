const mssql = require('../config/db').mssql
const sprintf = require('sprintf-js').sprintf

class KioskService {
  constructor() {}

  /**
   * ค้นหาข้อมูลผู้ป่วยห้องยา
   * @param {String} q
   */
  findPatientPharmacy(q) {
    // เลขบัตร ปชช
    if (String(q).length === 13) {
      return mssql.select('*').from('Q_No').where({ CardID: q }).first()
    } else {
      // HN
      return mssql
        .select('*')
        .from('Q_No')
        .where({ hn: sprintf(`%7s`, q) })
        .first()
    }
  }
}

module.exports = KioskService
