import path from 'path';
import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import logger from 'morgan';

import { User } from './models';
import db from './db';
import api from './api';
import setupMqttListener from './mqttListener';

import * as config from '../config';
import { createAdminUser } from './helpers';
import auth from './auth';

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
app.use(auth.initialize());

db(() => {
  createAdminUser(User);

  app.use('/api', api());
  app.use(express.static(config.STATIC_ROOT));
  app.all('*', function(req, res) {
    res.sendFile(path.join(config.STATIC_ROOT, 'index.html'));
  });

  app.server.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0', () => {
    console.log(`Started on port ${app.server.address().address}:${app.server.address().port}`);
  });

  setupMqttListener();
});

export default app;
