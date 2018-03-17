import { Router } from 'express';
import { Types } from 'mongoose';

import { hasAccess } from '../auth';
import { submitPoliceReport } from '../integrations/police';
import { Violation, ViolationStatus } from '../models';
import { PaginatedResponse } from './shared/pagination';

const ACTIONS = {
  SUBMIT_POLICE_REPORT: 'SUBMIT_POLICE_REPORT',
};

export default function() {
  var api = Router();

  api.get('/', hasAccess(), (req, res) => {
    PaginatedResponse(req, res, Violation, { shotAt: -1 });
  });

  api.delete('/', hasAccess(), (req, res) => {
    var ids = req.body.ids.map(id => Types.ObjectId(id));
    Violation.remove({ '_id': { $in: ids } }, (err) => {
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

  api.put('/:id', hasAccess(), (req, res) => {
    var id = req.params.id;
    var action = req.query.action;

    if (!Object.keys(ACTIONS).includes(action)) {
      return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    Violation.findOne({ _id: id}, (err, violation) => {
      if (err) {
        return res.status(404).json({status: 404, message: `Not found: ${id}`});
      }
      if (action === ACTIONS.SUBMIT_POLICE_REPORT) {
        submitPoliceReport(violation).then(() => {
          violation.status = ViolationStatus.SENT;
          violation.save((err, data) => {
            if (err) {
              return res.status(400).json({ error: err.toString() });
            }
            res.json(data);
          });
        }).catch((err) => {
          return res.status(400).json({ error: err.toString() });
        });
      }
    });
  });

  return api;
}
