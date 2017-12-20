import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import Promise from 'promise';

import { hasAccess } from '../auth';
import { WhitePlate } from '../models';

export default function() {
  var api = Router();
  var uploader = multer();

  api.get('/', hasAccess(), (req, res) => {
    WhitePlate.find({}, (err, data) => {
      if (err) throw err;
      res.json(data);
    });
  });

  api.post('/upload', hasAccess(), uploader.single('uploads'), (req, res) => {
    var workbook = xlsx.read(toByteString(req.file), {type:'binary'});
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    //get number of rows
    var range = xlsx.utils.decode_range(worksheet['!ref']);
    var rows = range.e.r;
    //starts at 1 and the first row is header hence i = 2;
    //provided file has this structure:x
    //A - garage Nr, B - automobile description, C - plane number
    var promises = [];
    for (var i = 2; i <= rows + 1; i++) {
      if (worksheet['A' + i] === undefined && worksheet['B' + i] === undefined && worksheet['C' + i] === undefined) {
        console.log('No more plates found starting row', i);
        break;
      }
      promises.push(saveWhitePlate(
        worksheet['C' + i] ? worksheet['C' + i].v : '',
        worksheet['B' + i] ? worksheet['B' + i].v : '',
        worksheet['A' + i] ? worksheet['C' + i].v : ''
      ));
    }
    Promise.all(promises)
      .then(function(data){
        var newPlates = data.filter((i) => i === 1).length;
        totalWhiteplates().then(
          total => {
            res.json({
              'total': total,
              'imported': data.length,
              'new': newPlates
            });
          });
      })
      .catch(err => {
        res.status(400).json({ error: err.toString() });
      });
  });

  api.post('/', hasAccess(), (req, res) => {
    var whiteplate = new WhitePlate(req.body);

    whiteplate.save((err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      res.status(201).json(data);
    });
  });

 //get white plate by vehicle number
  api.get('/search', hasAccess(), (req, res) => {
    var number = req.query.plate;

    WhitePlate.find({plate: number}, (err, data) => {
      if (err || !data)  {
        return res.status(400).json({ error: err.toString() });
      }
      res.json(data);
    });

  });

  api.get('/:id', hasAccess(), (req, res) => {
    var id = req.params.id;

    WhitePlate.findById(id, (err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      if (!data) {
        return res.status(404).json({status: 404, message: `Not found: ${id}`});
      }
      res.json(data);
    });

  });

  api.post('/:id', hasAccess(), (req, res) => {
    var id = req.params.id;

    WhitePlate.findByIdAndUpdate(id, req.body, { runValidators: true, new: true }, (err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      if (!data) {
        return res.status(404).json({status: 404, message: `Not found: ${id}`});
      }
      res.json(data);
    });

  });

  api.delete('/:id', hasAccess(), (req, res) => {
    var id = req.params.id;

    WhitePlate.findByIdAndRemove(id, (err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      if (!data) {
        return res.status(404).json({status: 404, message: `Not found: ${id}`});
      }
      res.json(data);
    });

  });

  function toByteString(file) {
    var arraybuffer = file.buffer;

    /* convert data to binary string */
    var data = new Uint8Array(arraybuffer);
    var arr = new Array();
    for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);

    return arr.join('');
  }

  function saveWhitePlate(plate, description, garageNr) {
    plate = plate.replace(/\s/g,'')
    return new Promise(function(resolve, reject) {
      WhitePlate.find({ plate }, (err, data) => {
        if (err) {
          return reject(err);
        }
        if (data.length === 0 || !data) {
          // No such plate in database
          var whiteplate = new WhitePlate({
            plate, description, garageNr
          });

          whiteplate.save((err) => {
            if (err) {
              reject(err);
            } else {
              resolve(1)
            }
          });
        } else {
          resolve(0);
        }
      });

    });
  }

  function totalWhiteplates() {
    return new Promise(function(resolve, reject) {
      WhitePlate.count({}, (err, count) => {
        if (err) {
          reject(0);
        } else {
          resolve(count);
        }
      });
    });
  }

  return api;
}
