import { Router } from 'express';
import passport from 'passport';

import { isAuthenticated } from '../helpers';

export default function() {
  var router = Router();

  router.post('/login', passport.authenticate('local'), function(req, res) {
    res.send({message: 'Login successful', token: 'abrakadabra'});
  });

  router.post('/logout', function(req, res) {
    req.logout();
    res.send({message: 'Logout successful'});
  });

  router.get('/me', isAuthenticated, function(req, res) {
    res.send(req.user);
  });

  return router;
}
