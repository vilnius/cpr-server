import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var piStatus = new Schema({
  id: {
    type: String,
    required: true,
    trim: true
  },
  ip: {
    type: String,
    required: true,
    trim: true
  },
  connected: {
    type: Boolean,
    required: true
  },
}, {
  timestamps: true
});

export default mongoose.model('piStatus', piStatus);
