import { Router } from 'express';

import { isAuthenticated } from '../helpers';
import { piStatus } from '../models';

export default function() {
  var api = Router();

  api.get('/', (req, res) => {
    piStatus.find({}, (err, data) => {
      if (err) throw err;
      res.json(data);
    });
  });

  return api;
}
