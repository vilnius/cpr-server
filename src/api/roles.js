import { Router } from 'express';

import { User } from '../models';
import { hasAccess, acl } from '../auth';
import { ROLES } from '../roles';

export default function() {
  var api = Router();

  api.post('/:role', hasAccess(), (req, res) => {
    var role = req.params.role;
    var { username } = req.body;

    if (!username || ROLES.indexOf(role) == -1) {
      return res.status(400).json({ message: 'Bad role or missing username' });
    }

    User.findOne({ username }, (err, user) => {
      if (err) throw err;
      if (!user) {
        return res.status(404).json({status: 404, message: `Not found: ${username}`});
      }
      acl.addUserRoles(username, role, (err) => {
        if (err) throw err;
        res.json({ message: `${username} is assigned role ${role}` });
      });
    });
  });

  api.delete('/:role', hasAccess(), (req, res) => {
    var role = req.params.role;
    var { username } = req.body;

    acl.removeUserRoles(username, role, (err) => {
      if (err) throw err;
      res.json({ message: `${username} no longer has role ${role}` });
    });
  });

  return api;
}
