import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime';
import multer from 'multer';
import { Router } from 'express';

import { UPLOAD_PATH } from '../../config';
import { hasAccess } from '../auth';

export default function() {
  var api = Router();
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_PATH);
    },
    filename: function (req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        cb(null, raw.toString('hex') + Date.now() + '_' + file.originalname);
      });
    }
  });
  var uploader = multer({ storage: storage });

  api.post('/', hasAccess(), uploader.single('image'), (req, res) => {
    console.log('File uploaded:', req.file);
    res.status(201).json(req.file);
  });

  api.get('/:id', (req, res) => {
    if (req.params.id !== path.normalize(req.params.id).replace(/^(\.\.[\/\\])+/, '')) {
      res.status(400).json({ error: 'Bad file ID' });
    }

    var filePath = path.join(UPLOAD_PATH, req.params.id);
    try {
      var stat = fs.statSync(filePath);
    } catch(e) {
      res.status(404).json({ error: 'File not found' });
    }
    res.writeHead(200, {
      'Content-Type': mime.lookup(filePath),
      'Content-Length': stat.size
    });
    fs.createReadStream(filePath).pipe(res);
  });

  return api;
}
