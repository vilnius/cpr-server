import { Router } from 'express';
import { Types } from 'mongoose';

import { hasAccess } from '../auth';
import { Shot } from '../models';
import { PaginatedResponse } from './shared/pagination';
import { deleteFiles } from './images';

export default function() {
  var api = Router();

  api.get('/', hasAccess(), (req, res) => {
    PaginatedResponse(req, res, Shot, { updatedAt: -1 });
  });

  api.delete('/', hasAccess(), (req, res) => {
    var { ids, plate, deleteImages } = req.body;
    if (!(ids || plate)) {
      return res.status(400).json({ error: 'Bad parameters: missing ids or plate' });
    }
    ids = ids && ids.map(id => Types.ObjectId(id));
    var query = ids ? { '_id': { $in: ids } } : { plate };
    Shot.find(query, (err, shots) => {
      ids = shots.map(shot => shot._id);
      Shot.remove({ '_id': { $in: ids } }, (err) => {
        if (err) {
          return res.status(400).json({ error: err.toString() });
        }
        if (deleteImages === true) {
          deleteFiles(shots.map(shot => shot.image));
        }
        res.json({ message: `${ids.length} shot(s) deleted` });
      });
    });
  });

  api.post('/', hasAccess(), (req, res) => {
    var shot = new Shot(req.body);

    shot.save((err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      res.status(201).json(data);
    });
  });

  api.get('/:id', hasAccess(), (req, res) => {
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

  api.post('/:id', hasAccess(), (req, res) => {
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
