import { Router } from 'express';

import { isAuthenticated } from '../helpers';
import { WhitePlate } from '../models';
import fs from 'fs';
import busboy from 'connect-busboy';
import xlsx from 'xlsx';

export default function() {
  var api = Router();
  api.use(busboy());

  api.get('/', isAuthenticated, (req, res) => {
    WhitePlate.find({}, (err, data) => {
      if (err) throw err;
      res.json(data);
    });
  });

  api.post('/upload', isAuthenticated, (req, res) => {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        fstream = fs.createWriteStream(__dirname + '/files/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
          var workbook = xlsx.readFile(__dirname + '/files/' + filename);
          var worksheet = workbook.Sheets[workbook.SheetNames[0]];
          //get number of rows
          var range = xlsx.utils.decode_range(worksheet['!ref']);
          var rows = range.e.r;
          //starts at 1 and the first row is header hence i = 2;
          //provided file has this structure: 
          //A - garage Nr, B - automobile description, C - plane number
          for (var i = 2; i <= rows; i++) {
            saveWhitePlate({
              plate: worksheet["C"+i].v,
              description: worksheet["B"+i].v,
              garageNr: worksheet["A"+i].v
            });
          }     
          res.json("OK")
        });
    });
  });

  api.post('/', isAuthenticated, (req, res) => {
    var whiteplate = new WhitePlate(req.body);

    whiteplate.save((err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      res.status(201).json(data)
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
      res.json(data)
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
      res.json(data)
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
      res.json(data)
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
      res.json(data)
    });

  });

  function saveWhitePlate(whitePlate) {
    var whiteplate = new WhitePlate(whitePlate);

    whiteplate.save((err, data) => {
      if (err) {
        //handle err
      }
    });
  }

  return api;
}
