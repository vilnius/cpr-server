import { Router } from 'express';

import { isAuthenticated } from '../helpers';
import { Penalty } from '../models';

import { Types } from 'mongoose';

export default function() {
  var api = Router();

  api.get('/', isAuthenticated, (req, res) => {
    var perPage = parseInt(req.query.perPage),
        page = parseInt(req.query.page);

    perPage = isNaN(perPage) ? 10 : perPage;
    page = isNaN(page) ? 1 : page;

    Penalty.find({})
      .limit(perPage)
      .skip(perPage*(page-1))
      .sort({ updatedAt: -1 })
      .exec((err, data) => {
        if (err) throw err;
        Penalty.count().exec((err, count) => {
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
    Penalty.remove({ '_id': { $in: ids } }, (err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      res.json({ message: `${ids.length} penalties deleted` });
    });
  });

  api.post('/', isAuthenticated, (req, res) => {
    var penalty = new Penalty(req.body);

    penalty.save((err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      res.status(201).json(data);
    });
  });

  api.get('/:id', isAuthenticated, (req, res) => {
    var id = req.params.id;

    Penalty.findById(id, (err, data) => {
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

    Penalty.findByIdAndUpdate(id, req.body, { runValidators: true, new: true }, (err, data) => {
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
