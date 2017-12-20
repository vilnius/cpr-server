import { Router } from 'express';
import lanemaps from './lanemaps';
import users from './users';
import roles from './roles';
import tokens from './tokens';
import shots from './shots';
import whitelist from './whitelist';
import images from './images';
import piStatus from './pistatus';
import violations from './violations';

import * as config from '../../config';

const handleAuthError = (err, req, res, next) => {
  if (err.name !== 'HttpError' || !err.errorCode) return next(err);
  res.status(err.errorCode).json({
    status: err.errorCode,
    message: err.message
  });
};

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
  api.use('/roles', roles());
  api.use('/lanemaps', lanemaps());
  api.use('/shots', shots());
  api.use('/whitelist', whitelist());
  api.use('/images', images());
  api.use('/pistatus', piStatus());
  api.use('/violations', violations());
  api.use(handleAuthError);

  api.all('*', function(req, res) {
    res.status(404).json({
      message: 'Not found: Unknown endpoint URL and/or method'
    });
  });

  return api;
}
