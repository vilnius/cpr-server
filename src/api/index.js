import { Router } from 'express';
import lanemaps from './lanemaps';
import users from './users';
import auth from './auth';
import penalties from './penalties';
import whitelist from './whitelist';
import images from './images';
import piStatus from './pistatus';

export default function() {
  var api = Router();

  api.get('/', (req, res) => {
    res.json({
      description: 'Car Plate Reader API',
      version: '1.0'
    });
  });

  api.use('/auth', auth());
  api.use('/users', users());
  api.use('/lanemaps', lanemaps());
  api.use('/penalties', penalties());
  api.use('/whitelist', whitelist());
  api.use('/images', images());
  api.use('/pistatus', piStatus());

  api.get('*', function(req, res) {
    res.status(404).json({
      message: 'Not found: Unknown endpoint URL and/or method'
    });
  });

  return api;
}
