import { Router } from 'express';
import { Types } from 'mongoose';

import { hasAccess } from '../auth';
import { Violation } from '../models';
import { PaginatedResponse } from './shared/pagination';

export default function() {
  var api = Router();

  api.get('/', hasAccess(), (req, res) => {
    PaginatedResponse(req, res, Violation, { shotAt: -1 });
  });

  api.delete('/', hasAccess(), (req, res) => {
    var ids = req.body.ids.map(id => Types.ObjectId(id));
    Violation.remove({ '_id': { $in: ids } }, (err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      res.json({ message: `${ids.length} violation(s) deleted` });
    });
  });

  api.post('/', hasAccess(), (req, res) => {
    var shot = new Violation(req.body);

    shot.save((err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      res.status(201).json(data);
    });
  });

  api.get('/:id', hasAccess(), (req, res) => {
    var id = req.params.id;

    Violation.findById(id, (err, data) => {
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

    Violation.findByIdAndUpdate(id, req.body, { runValidators: true, new: true }, (err, data) => {
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
