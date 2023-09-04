const passportJWT = require('passport-jwt')
const passport = require('passport')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy
const UserService = require('../services/user.service')

passport.serializeUser((user, done) => {
  done(null, user.id)
})

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  issuer: process.env.JWT_ISSUER,
  jsonWebTokenOptions: {
    algorithm: process.env.JWT_ALGORITHM,
    notBefore: process.env.JWT_NOTBEFORE,
    expiresIn: process.env.JWT_EXPIRESIN,
    issuer: process.env.JWT_ISSUER,
  },
  passReqToCallback: true,
}

const jwtStrategyConfig = new JwtStrategy(jwtOptions, async (req, jwt_payload, done) => {
  try {
    const UserServiceModel = new UserService()
    const user = await UserServiceModel.findById(jwt_payload.aud)
    if (user) {
      req.user = user
      return done(null, user)
    } else {
      return done(null, false)
    }
  } catch (error) {
    return done(error, false)
  }
})
passport.use(jwtStrategyConfig)
