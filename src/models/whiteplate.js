import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var WhitePlate = new Schema({
  plate: String,
  description: String,
  garageNr: String
}, {
  timestamps: true
});

export default mongoose.model('WhitePlate', WhitePlate);
