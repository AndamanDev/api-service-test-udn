const express = require('express')
const router = express.Router()
const controllers = require('../../controllers/user.controller')

// เข้าสู่ระบบ
router.post('/login', controllers.login)

module.exports = router
