import { Router } from 'express';

import { isAuthenticated } from '../helpers';
import { User } from '../models';

export default function() {
  var api = Router();

  api.get('/', isAuthenticated, (req, res) => {
    User.find({}, (err, user) => {
      if (err) throw err;
      res.json(user);
    });
  });

  api.post('/', isAuthenticated, (req, res) => {
    var {username, password} = req.body;

    User.register(new User(req.body), password, (err) => {
      if (err) {
        return res.status(400).json({ error: `Error registering username: ${err}` });
      }
      res.status(201).json({ message: `User created: ${username}` });
    });
  });

  api.get('/:id', isAuthenticated, (req, res) => {
    var id = req.params.id;

    User.findById(id, (err, user) => {
      if (err) throw err;
      if (!user) {
        return res.status(404).json({status: 404, message: `Not found: ${id}`});
      }
      res.json(user);
    });

  });

  api.post('/:id', isAuthenticated, (req, res) => {
    // TODO: Passwords are not changed here
    var id = req.params.id;

    User.findByIdAndUpdate(id, req.body, { runValidators: true, new: true }, (err, user) => {
      if (err) throw err;
      if (!user) {
        return res.status(404).json({status: 404, message: `Not found: ${id}`});
      }
      if (req.body.password) {
        user.setPassword(req.body.password, () => {
          user.save();
          delete user.hash;
          delete user.salt;
          res.json(user);
        });
      } else {
        res.json(user);
      }
    });

  });

  return api;
}
