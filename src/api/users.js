import { Router } from 'express';

import { User } from '../models';
import { hasAccess } from '../auth';

export default function() {
  var api = Router();

  api.get('/', hasAccess(), (req, res) => {
    User.find({}, (err, user) => {
      if (err) throw err;
      res.json(user);
    });
  });

  api.post('/', hasAccess(), (req, res) => {
    var {username, password} = req.body;

    User.register(new User(req.body), password, (err) => {
      if (err) {
        return res.status(400).json({ error: `Error registering username: ${err}` });
      }
      res.status(201).json({ message: `User created: ${username}` });
    });
  });

  api.get('/:id', hasAccess(), (req, res) => {
    var id = req.params.id;

    User.findById(id, (err, user) => {
      if (err) throw err;
      if (!user) {
        return res.status(404).json({status: 404, message: `Not found: ${id}`});
      }
      res.json(user);
    });
  });

  api.post('/:id', hasAccess(), (req, res) => {
    var id = req.params.id;
    if (id !== req.user._id) {
      return res.status(404).json({status: 404, message: `Not found: ${id}`});
    }

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
