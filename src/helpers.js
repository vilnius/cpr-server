export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  else {
    res.status(401);
    res.send({ status: 401, error: '401 Unauthorized'})
  }
}

export function createAdminUser(User) {
  // creates default user with username: admin, password: admin
  User.findOne({ username: 'admin' }, function(err, data) {
    if (err) throw err;
    if (!data) {
      User.register(new User({ username: 'admin', name: 'Administrator', email: 'admin' }), 'admin', function(err, account) {
      if (err) {
        console.error('Error creating super user!', err);
      } else {
        console.log('Created new user: admin, password: admin');
      }
      });
    }
  });
}