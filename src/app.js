import path from 'path';
import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import logger from 'morgan';

import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

import {User} from './models';
import middleware from './middleware';
import db from './db';
import api from './api';
import mqttListener from './mqttListener';

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

app.use(session({
  secret: config.SECRET,
  resave: false,
  saveUninitialized: false
}));

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure passport-local to use user model for authentication
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

db(() => {
  createAdminUser(User);
  // internal middleware
  app.use(middleware());
  // api router
  app.use('/api', api());
  // static files
  app.use(express.static(config.STATIC_ROOT));
  // redirect all to index
  app.get('*', function (req, res) {
    res.sendFile('index.html', {
      root: path.join(__dirname, 'public')
    });
  });
  app.server.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0', () => {
    console.log(`Started on port ${app.server.address().address}:${app.server.address().port}`);
  });

  mqttListener();
});

export default app;
