import { Router } from 'express';

import { isAuthenticated } from '../helpers';
import { Penalty } from '../models';

export default function() {
  var api = Router();

  api.get('/', (req, res) => {
    Penalty.find({}, (err, data) => {
      if (err) throw err;
      res.json(data);
    });
  });

  api.post('/', isAuthenticated, (req, res) => {
    var penalty = new Penalty(req.body);

    penalty.save((err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      res.status(201).json(data)
    });
  });

  api.get('/:id', (req, res) => {
    var id = req.params.id;

    Penalty.findById(id, (err, data) => {
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

    Penalty.findByIdAndUpdate(id, req.body, { runValidators: true, new: true }, (err, data) => {
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
