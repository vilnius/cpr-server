import mongoose from 'mongoose';

export default function(callback) {
  mongoose.connect('mongodb://localhost/cpr');
  var db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    callback(db);
  });

}
