import path from 'path';
import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import logger from 'morgan';

import db from './db';
import api from './api';
import setupMqttListener from './mqttListener';

import * as config from '../config';
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

db((connection) => {
  app.use(auth.initialize(connection));
  app.use('/api', api());
  app.use(express.static(config.STATIC_ROOT));
  app.all('*', function(req, res) {
    res.sendFile(path.join(config.STATIC_ROOT, 'index.html'));
  });

  setupMqttListener();

  app.server.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0', () => {
    console.log(`Started on port ${app.server.address().address}:${app.server.address().port}`);
  });
});

export default app;
