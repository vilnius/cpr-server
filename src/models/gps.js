import mongoose from 'mongoose';

export const Gps = {
  lat: { type: Number, required: true },
  lon: { type: Number, required: true }
};
