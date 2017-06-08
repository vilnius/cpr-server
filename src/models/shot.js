import mongoose from 'mongoose';
import { Gps } from './gps';

var Plate = {
  plate: String,
  probability: Number
};

var Shot = new mongoose.Schema({
  image: String,
  plate: String,
  gps: Gps,
  plates: [Plate],
  shotAt: Date
}, {
  timestamps: true
});

export default mongoose.model('Shot', Shot);
