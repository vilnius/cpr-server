import { Router } from 'express';

export default function() {
  var app = Router();

  // app.use(function(req, res, next) {
  //   console.log('Middleware here!');
  //   return next();
  // });

  return app;
}
