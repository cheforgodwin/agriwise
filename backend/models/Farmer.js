import mongoose from 'mongoose';
import { CAMEROON_REGIONS } from '../config/regions.js';

const farmerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    pinHash: { type: String, required: true },
    isPhoneVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ['farmer', 'buyer', 'officer'],
      required: true
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'fr'],
      default: 'en'
    },
    location: {
      region: {
        type: String,
        enum: CAMEROON_REGIONS,
        required: true
      },
      quarter: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 80
      },
      gps: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date }
  },
  { timestamps: true, collection: 'farmers' }
);

farmerSchema.index({ 'location.region': 1, 'location.quarter': 1 });

farmerSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

const Farmer = mongoose.model('Farmer', farmerSchema);

export default Farmer;
