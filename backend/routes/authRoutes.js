import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Farmer from '../models/Farmer.js';
import { CAMEROON_REGIONS } from '../config/regions.js';
import { sendOTP } from '../utils/smsService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const signToken = (farmer) =>
  jwt.sign({ id: farmer._id, role: farmer.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const safeUser = (farmer) => ({
  id: farmer._id,
  fullName: farmer.fullName,
  phone: farmer.phone,
  role: farmer.role,
  location: farmer.location,
  preferredLanguage: farmer.preferredLanguage,
  isPhoneVerified: farmer.isPhoneVerified
});

router.post('/register', async (req, res) => {
  try {
    const { fullName, phone, pin, role, region, quarter, gps } = req.body;

    if (!fullName || !phone || !pin || !role || !region || !quarter) {
      return res.status(400).json({
        error: 'fullName, phone, pin, role, region, quarter are required'
      });
    }

    if (!CAMEROON_REGIONS.includes(region)) {
      return res.status(400).json({
        error: 'Invalid region',
        allowedRegions: CAMEROON_REGIONS
      });
    }

    if (quarter.trim().length < 2 || quarter.trim().length > 80) {
      return res.status(400).json({ error: 'Quarter must be 2-80 characters' });
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be 4-6 digits' });
    }

    const existing = await Farmer.findOne({ phone });
    if (existing) {
      return res.status(409).json({ error: 'Phone already registered' });
    }

    const pinHash = await bcrypt.hash(pin, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(
      Date.now() + (Number(process.env.OTP_EXPIRES_MINUTES) || 10) * 60 * 1000
    );

    const farmer = new Farmer({
      fullName,
      phone,
      pinHash,
      role,
      preferredLanguage: req.userLanguage,
      location: {
        region,
        quarter: quarter.trim(),
        gps:
          gps && typeof gps.lat === 'number' && typeof gps.lng === 'number'
            ? { lat: gps.lat, lng: gps.lng }
            : undefined
      },
      otp,
      otpExpiresAt
    });

    await farmer.save();
    await sendOTP(phone, otp, req.userLanguage);

    res.status(201).json({
      message: 'Registered. OTP sent to phone.',
      language: req.userLanguage,
      userId: farmer._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    const farmer = await Farmer.findOne({ phone });
    if (!farmer) return res.status(404).json({ error: 'User not found' });

    if (farmer.otp !== otp || farmer.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    farmer.isPhoneVerified = true;
    farmer.otp = undefined;
    farmer.otpExpiresAt = undefined;
    await farmer.save();

    const token = signToken(farmer);
    res.json({ message: 'Phone verified', token, user: safeUser(farmer) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) {
      return res.status(400).json({ error: 'Phone and PIN required' });
    }

    const farmer = await Farmer.findOne({ phone });
    if (!farmer) return res.status(401).json({ error: 'Invalid credentials' });

    if (farmer.isLocked()) {
      return res.status(423).json({
        error: 'Account locked. Try again later or reset PIN.'
      });
    }

    const match = await bcrypt.compare(pin, farmer.pinHash);
    if (!match) {
      farmer.failedLoginAttempts += 1;
      if (farmer.failedLoginAttempts >= 3) {
        farmer.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        farmer.failedLoginAttempts = 0;
      }
      await farmer.save();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    farmer.failedLoginAttempts = 0;
    farmer.lockUntil = undefined;
    await farmer.save();

    const token = signToken(farmer);
    res.json({ message: 'Login successful', token, user: safeUser(farmer) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone required' });

    const farmer = await Farmer.findOne({ phone });
    if (!farmer) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    farmer.otp = otp;
    farmer.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await farmer.save();

    await sendOTP(phone, otp, farmer.preferredLanguage);
    res.json({ message: 'OTP sent to phone' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reset-pin', async (req, res) => {
  try {
    const { phone, otp, newPin } = req.body;
    if (!phone || !otp || !newPin) {
      return res.status(400).json({ error: 'All fields required' });
    }
    if (!/^\d{4,6}$/.test(newPin)) {
      return res.status(400).json({ error: 'PIN must be 4-6 digits' });
    }

    const farmer = await Farmer.findOne({ phone });
    if (!farmer) return res.status(404).json({ error: 'User not found' });

    if (farmer.otp !== otp || farmer.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    farmer.pinHash = await bcrypt.hash(newPin, 10);
    farmer.otp = undefined;
    farmer.otpExpiresAt = undefined;
    farmer.failedLoginAttempts = 0;
    farmer.lockUntil = undefined;
    await farmer.save();

    res.json({ message: 'PIN reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.userId).select(
      '-pinHash -otp -otpExpiresAt'
    );
    if (!farmer) return res.status(404).json({ error: 'User not found' });
    res.json({ user: farmer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
