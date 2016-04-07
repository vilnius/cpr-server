import mongoose from 'mongoose';
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true
  },
  updated: {
    type: Date,
    default: Date.now
  }
}, {
    timestamps: true
});

User.plugin(passportLocalMongoose);

export default mongoose.model('User', User);
