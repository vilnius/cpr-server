import { Router } from 'express';

import { hasAccess } from '../auth';
import { Lanemap } from '../models';

export default function() {
  var api = Router();

  api.get('/', (req, res) => {
    Lanemap.find({}, (err, data) => {
      if (err) throw err;
      res.json(data);
    });
  });

  api.post('/', hasAccess(), (req, res) => {
    var lanemap = new Lanemap(req.body);

    lanemap.save((err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      res.status(201).json(data);
    });
  });

  api.get('/:id/:attribute?', (req, res) => {
    var id = req.params.id;
    var attribute = req.params.attribute;

    Lanemap.findById(id, (err, data) => {
      if (err) {
        return res.status(400).json({ error: err.toString() });
      }
      if (!data) {
        return res.status(404).json({status: 404, message: `Not found: ${id}`});
      }
      if (attribute && /geojson/i.test(attribute)) {
        res.json(data.geoJSON);
      } else {
        res.json(data);
      }
    });

  });

  api.post('/:id', hasAccess(), (req, res) => {
    var id = req.params.id;

    Lanemap.findByIdAndUpdate(id, req.body, { runValidators: true, new: true }, (err, data) => {
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
