import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var Lanemap = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  geoJSON: {
    type: Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Lanemap', Lanemap);
