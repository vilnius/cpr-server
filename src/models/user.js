import mongoose from 'mongoose';
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
  name: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  }
}, {
    timestamps: true
});

// Creates fields/methods required for authentication middleware
User.plugin(passportLocalMongoose);

export default mongoose.model('User', User);
