import { Router } from 'express';
import lanemaps from './lanemaps';
import users from './users';
import auth from './auth';
import penalties from './penalties';

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

  return api;
}
