import { Router } from 'express';
import { Types } from 'mongoose';

import { isAuthenticated } from '../helpers';
import { Shot } from '../models';

var DEFAULT_PER_PAGE = 15;

export default function() {
  var api = Router();

  api.get('/', isAuthenticated, (req, res) => {
    var perPage = parseInt(req.query.perPage),
        page = parseInt(req.query.page);

    perPage = isNaN(perPage) ? DEFAULT_PER_PAGE : perPage;
    page = isNaN(page) ? 1 : page;

    Shot.find({})
      .limit(perPage)
      .skip(perPage*(page-1))
      .sort({ updatedAt: -1 })
      .exec((err, data) => {
        if (err) throw err;
        Shot.count().exec((err, count) => {
          var response = {
            pagination: {
              page,
              perPage,
              total: count,
              pages: Math.ceil(count/perPage)
            },
            objects: data
          }
          res.json(response);
        });
      });
  });

  api.delete('/', isAuthenticated, (req, res) => {
    var ids = req.body.ids.map(id => Types.ObjectId(id));
    Shot.remove({ '_id': { $in: ids } }, (err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      res.json({ message: `${ids.length} shots deleted` });
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
