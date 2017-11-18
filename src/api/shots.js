import { Router } from 'express';
import { Types } from 'mongoose';

import { isAuthenticated } from '../auth';
import { Shot } from '../models';
import { PaginatedResponse } from './shared/pagination';

export default function() {
  var api = Router();

  api.get('/', isAuthenticated, (req, res) => {
    PaginatedResponse(req, res, Shot, { updatedAt: -1 });
  });

  api.delete('/', isAuthenticated, (req, res) => {
    var ids = req.body.ids.map(id => Types.ObjectId(id));
    Shot.remove({ '_id': { $in: ids } }, (err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      res.json({ message: `${ids.length} shot(s) deleted` });
    });
  });

  api.post('/', isAuthenticated, (req, res) => {
    var shot = new Shot(req.body);

    shot.save((err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      res.status(201).json(data);
    });
  });

  api.get('/:id', isAuthenticated, (req, res) => {
    var id = req.params.id;

    Shot.findById(id, (err, data) => {
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

    Shot.findByIdAndUpdate(id, req.body, { runValidators: true, new: true }, (err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      if (!data) {
        return res.status(404).json({status: 404, message: `Not found: ${id}`});
      }
      res.json(data);
    });

  });

  return api;
}
