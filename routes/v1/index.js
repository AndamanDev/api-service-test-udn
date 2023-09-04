const router = require('express').Router()

router.use('/kiosk', require('./kiosk'))
router.use('/user', require('./user'))

module.exports = router
