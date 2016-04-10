import { Router } from 'express';

import { isAuthenticated } from '../helpers';
import { User } from '../models';

export default function() {
  var api = Router();

  api.get('/', (req, res) => {
    User.find({}, (err, data) => {
      if (err) throw err;
      res.json(data);
    });
  });

  api.post('/', (req, res, next) => {
    var {username, password} = req.body;

    User.register(new User(req.body), password, (err, user) => {
      if (err) {
        return res.status(400).json({ error: `Error registering username: ${err}` });
      }
      res.status(201).json({ message: `User created: ${username}` });
    });
  });

  api.get('/:id', (req, res) => {
    var id = req.params.id;

    User.findById(id, (err, data) => {
      if (err) throw err;
      if (!data) {
        return res.status(404).json({status: 404, message: `Not found: ${id}`});
      }
      res.json(data)
    });

  });

  api.post('/:id', (req, res) => {
    // TODO: Passwords are not changed here
    var id = req.params.id;

    User.findByIdAndUpdate(id, req.body, { runValidators: true, new: true }, (err, data) => {
      if (err) throw err;
      if (!data) {
        return res.status(404).json({status: 404, message: `Not found: ${id}`});
      }
      res.json(data)
    });

  });


  return api;
}
