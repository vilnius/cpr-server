import { Router } from 'express';
import lanemaps from './lanemaps';
import users from './users';
import tokens from './tokens';
import shots from './shots';
import whitelist from './whitelist';
import images from './images';
import piStatus from './pistatus';
import violations from './violations';

import * as config from '../../config';

export default function() {
  var api = Router();

  api.get('/', (req, res) => {
    res.json({
      description: 'Car Plate Reader API',
      version: config.VERSION
    });
  });

  api.use('/tokens', tokens());
  api.use('/users', users());
  api.use('/lanemaps', lanemaps());
  api.use('/shots', shots());
  api.use('/whitelist', whitelist());
  api.use('/images', images());
  api.use('/pistatus', piStatus());
  api.use('/violations', violations());

  api.all('*', function(req, res) {
    res.status(404).json({
      message: 'Not found: Unknown endpoint URL and/or method'
    });
  });

  return api;
}
