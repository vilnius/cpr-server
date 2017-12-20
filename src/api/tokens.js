import { Router } from 'express';
import passport from 'passport';

import auth from '../auth';

export default function() {
  var router = Router();

  router.post('/login', auth.authenticate);
  router.post('/refresh', auth.isAuthenticated, auth.refreshToken);
  router.get('/me', auth.isAuthenticated, function(req, res) {
    res.send(req.user);
  });

  return router;
}
