import mongoose from 'mongoose';
import { Gps } from './gps';

var Schema = mongoose.Schema;

export const ViolationStatus = {
  NEW: 'NEW',
  SENT: 'SENT',
  CLOSED: 'CLOSED'
};

var Location = {
  city: String,
  subdistrict: String,
  country: String,
  street: String,
  houseNumber: String,
  gps: Gps
};

var Person = {
  firstName: String,
  lastName: String,
  address: String,
  phone: String,
  email: String
};

var Violation = new Schema({
  shotAt: Date,
  status: {
    type: String,
    uppercase: true,
    enum: Object.keys(ViolationStatus),
    default: ViolationStatus.NEW
  },
  images: [String],
  location: Location,
  violationType: String,
  plate: {
    type: String,
    required: true
  },
  witness: Person,
  notes: String
}, {
  timestamps: true
});

export default mongoose.model('Violation', Violation);
