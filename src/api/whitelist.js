import { Router } from 'express';

import { isAuthenticated } from '../helpers';
import { WhitePlate } from '../models';

export default function() {
  var api = Router();

  api.get('/', isAuthenticated, (req, res) => {
    WhitePlate.find({}, (err, data) => {
      if (err) throw err;
      res.json(data);
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
  
 //get white plate by vehicle number
  api.get('/number/:number', isAuthenticated, (req, res) => {
    var number = req.params.number;

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

  return api;
}
