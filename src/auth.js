import Acl from 'acl';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

import * as config from '../config';
import { User } from './models';

const opts = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.AUTH_SECRET,
  expiresIn: config.AUTH_TOKEN_EXPIRESIN,
};

const makeSignedToken = (username) => {
  const payload = { username };
  const token = jwt.sign(payload, opts.secretOrKey, { expiresIn: opts.expiresIn });
  return {
    token,
    expiresIn: opts.expiresIn
  }
}

const authenticate = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const authenticate = User.authenticate();
  authenticate(username, password, function(err, user) {
    if (user) {
      return res.json(makeSignedToken(user.username));
    }
    res.status(401).json({status: 401, message: "Unable to login"});
  });
}

const refreshToken = (req, res) => {
  return res.json(makeSignedToken(req.user.username));
}

passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  User.findOne({username: jwt_payload.username}, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}));

export default {
  initialize: () => {
    return passport.initialize();
  },
  isAuthenticated: () => {
    return passport.authenticate('jwt', { session: false });
  },
  authenticate,
  refreshToken
}
