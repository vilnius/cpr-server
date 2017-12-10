import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime';
import multer from 'multer';
import { Router } from 'express';

import { UPLOAD_PATH } from '../../config';
import { hasAccess } from '../auth';

function deleteFile(filename) {
  var filePath = path.join(UPLOAD_PATH, filename);
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      console.log(`Deleting ${filePath}`);
      fs.unlink(filePath, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    } else {
      // return OK even if file doesn't exist
      return resolve();
    }
  })
}

export function deleteFiles(filenames) {
  return Promise.all(filenames.map(deleteFile));
}

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

  api.delete('/:id', hasAccess(), (req, res) => {
    if (req.params.id !== path.normalize(req.params.id).replace(/^(\.\.[\/\\])+/, '')) {
      res.status(400).json({ error: 'Bad file ID' });
    }
    deleteFile(req.params.id).then(
      () => res.json({ message: `${req.params.id} no longer exists` }),
      (error) => res.status(400).json({ error })
    );
  });

  api.get('/:id', /* NO AUTHORIZATION NEEDED */ (req, res) => {
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
