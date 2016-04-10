import { Router } from 'express';
import passport from 'passport';

import { isAuthenticated } from '../helpers';
import { Lanemap } from '../models';

export default function() {
  var router = Router();

  router.post('/login', passport.authenticate('local'), function(req, res, next) {
    res.send({message: 'Login successful'});
  });

  router.post('/logout', isAuthenticated, function(req, res, next) {
    req.logout();
    res.send({message: 'Logout successful'});
  });

  router.get('/me', isAuthenticated, function(req, res, next) {
    res.send(req.user);
  });

  return router;
};
