import Acl from 'acl';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

import * as config from '../config';
import { User } from './models';
import roles from './roles';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  secretOrKey: config.AUTH_SECRET,
  expiresIn: config.AUTH_TOKEN_EXPIRESIN,
};

export let acl;

function createUser(username) {
  // creates user if it does not exist, password is the same as username
  User.findOne({ username: username }, (err, data) => {
    if (err) throw err;
    if (!data) {
      User.register(new User({ username, name: username, email: username }), username, (err) => {
        if (err) {
          console.error('Error creating user!', err);
        } else {
          console.log(`Created new user ${username}`);
        }
      });
    }
  });
}

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

passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
  User.findOne({username: jwtPayload.username}, (err, user) => {
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

export const isAuthenticated = passport.authenticate('jwt', { session: false });

export const hasAccess = (action) => {
  return [isAuthenticated, acl.middleware(2, getUsername, action)]
}

const only = (role) => {
  return [isAuthenticated, (req, res, next) => {
    acl.hasRole(req.user.username, role).then((result) => {
      if (result) {
        return next();
      }
      res.status(403).send({ status: 403, error: 'Unauthorized' });
    });
  }]
}

function getUsername(req) {
  return req.user.username;
}

export default {
  initialize: (connection) => {
    // new Acl(new Acl.memoryBackend());
    acl = new Acl(new Acl.mongodbBackend(connection.db, 'acl_'));
    acl.allow(roles);

    createUser('admin');
    acl.addUserRoles('admin', 'admin')

    return passport.initialize();
  },
  isAuthenticated: isAuthenticated,
  hasAccess,
  only,
  authenticate,
  refreshToken
}
