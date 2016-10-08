import path from 'path';
import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import logger from 'morgan';
import csrf from 'csurf';

import passport from 'passport';

import {User} from './models';
import middleware from './middleware';
import db from './db';
import api from './api';
import setupMqttListener from './mqttListener';

import * as config from '../config';
import {createAdminUser} from './helpers';

var app = express();
app.server = http.createServer(app);

app.use(cors({
  exposedHeaders: ['Link']
}));

app.use(bodyParser.json({
  limit : '5000kb'
}));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(logger('dev'));

db((connection) => {

  const MongoStore = connectMongo(session);
  app.use(session({
    secret: config.SECRET,
    saveUninitialized: false,   // don't create session until something stored
    resave: false,              // don't save session if unmodified
    store: new MongoStore({
      mongooseConnection: connection,
      ttl: 14 * 24 * 60 * 60,   // session expiration = 14 days. Default
      touchAfter: 24 * 60 * 60  // update session only once every 24 hours
    })
  }));

  // Configure passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport-local to use user model for authentication
  passport.use(User.createStrategy());
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  createAdminUser(User);

  app.use(cookieParser());
  app.use(csrf({ cookie: true }));

  // internal middleware
  app.use(middleware());
  // api router
  app.use('/api', api());
  // serve index page and provide CSRF token
  app.get('/', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken()).sendFile(path.join(config.STATIC_ROOT, 'index.html'));
  });
  // serve static files
  app.use(express.static(config.STATIC_ROOT));

  app.server.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0', () => {
    console.log(`Started on port ${app.server.address().address}:${app.server.address().port}`);
  });

  setupMqttListener();
});

export default app;
