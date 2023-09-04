const express = require('express')
const router = express.Router()
const authenticateToken = require('../../middlewares/authenticate-token')
const authenticateJwt = require('../../middlewares/authenticate-jwt')
const controllers = require('../../controllers/kiosk.controller')

// ตรวจสอบสิทธิ
router.get('/pt-right/:cid', authenticateToken, controllers.getPatientRight)
// ค้นหาข้อมูลผู้ป่วย ห้องจ่ายยา
router.get('/patient-pharmacy/:q', authenticateToken, controllers.getPatientPharmacy)

module.exports = router
