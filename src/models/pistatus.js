import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var piStatus = new Schema({
  uid: {
    type: String,
    required: true,
    trim: true
  },
  vpnIp: String,
  version: String,
  hostname: String,
  freemem: Number,
  uptime: Number,
  gps: {
    satelites: Number,
    hdop: Number,
    inPolygon: Boolean
  },
  temp: String,
  connected: Boolean
}, {
  timestamps: true
});

export default mongoose.model('piStatus', piStatus);
