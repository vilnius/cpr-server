import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var PlateSchema = new Schema({ plate: String, probability: Number });

var Penalty = new Schema({
  image: String,
  plate: String,
  gps: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  plates: [PlateSchema],
  shotAt: Date
}, {
  timestamps: true
});

export default mongoose.model('Penalty', Penalty);
