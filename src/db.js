import mongoose from 'mongoose';

import * as config from '../config';

export default function(callback) {
  mongoose.Promise = global.Promise;
  mongoose.connect(config.MONGODB_URI, {
    useMongoClient: true,
    promiseLibrary: global.Promise
  });
  var db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log(`Connected to ${db.name} DB`);
    callback(db);
  });

}
