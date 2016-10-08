import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import Promise from 'promise';
import { isAuthenticated } from '../helpers';
import { WhitePlate } from '../models';

export default function() {
  var api = Router();
  var uploader = multer();

  api.get('/', isAuthenticated, (req, res) => {
    WhitePlate.find({}, (err, data) => {
      if (err) throw err;
      res.json(data);
    });
  });

  api.post('/upload', isAuthenticated, uploader.single('uploads'), (req, res) => {
    var workbook = xlsx.read(toByteString(req.file), {type:'binary'});
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    //get number of rows
    var range = xlsx.utils.decode_range(worksheet['!ref']);
    var rows = range.e.r;
    //starts at 1 and the first row is header hence i = 2;
    //provided file has this structure:x
    //A - garage Nr, B - automobile description, C - plane number
    for (var i = 2; i <= rows + 1; i++) {
      if (worksheet['A' + i] === undefined || worksheet['B' + i] === undefined || worksheet['C' + i] === undefined) {
        console.log(i);
        console.log(worksheet['A' + i], worksheet['B' + i], worksheet['C' + i]);
      }
      saveWhitePlate({
        plate: worksheet['C' + i] ? worksheet['C' + i].v : '',
        description: worksheet['B' + i] ? worksheet['B' + i].v : '',
        garageNr: worksheet['A' + i] ? worksheet['C' + i].v : ''
      });
    }
    totalWhiteplates().then(
      function(total) {
        res.json({
          'total': total,
          'new': rows
        });
      }
    );
  });

  api.post('/', isAuthenticated, (req, res) => {
    var whiteplate = new WhitePlate(req.body);

    whiteplate.save((err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      res.status(201).json(data);
    });
  });

 //get white plate by vehicle number
  api.get('/search', isAuthenticated, (req, res) => {
    var number = req.query.plate;

    WhitePlate.find({plate: number}, (err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      if (data.length === 0 || !data) {
        return res.status(404).json({status: 404, message: `Plate: ${number} not found.`});
      }
      res.json(data);
    });

  });

  api.get('/:id', isAuthenticated, (req, res) => {
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

  api.post('/:id', isAuthenticated, (req, res) => {
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

  api.delete('/:id', isAuthenticated, (req, res) => {
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

  function saveWhitePlate(whitePlate) {
    var whiteplate = new WhitePlate(whitePlate);

    whiteplate.save((err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  function totalWhiteplates() {
    return new Promise(function(resolve,reject) {
      WhitePlate.find({}, (err, data) => {
        if (err) {
          reject(0);
        } else {
          resolve(data.length);
        }
      });
    });
  }

  return api;
}
