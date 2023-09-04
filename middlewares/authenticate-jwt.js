const passport = require('passport')
const createError = require('http-errors')

module.exports = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err)
    if (!user) next(createError(401, 'Unauthorized.'))
    next()
  })(req, res, next)
}
