const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'volunteer', 'vet', 'admin'], default: 'citizen' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  district: { type: String },
  skills: [{ type: String, enum: ['vehicle', 'first-aid', 'large-animal'] }],
  isAvailable: { type: Boolean, default: true },
  fcmToken: { type: String }, // Firebase push token
  rescueCount: { type: Number, default: 0 },
  credits: { type: Number, default: 0 },
  badge: { type: String, enum: ['none', 'bronze', 'silver', 'gold'], default: 'none' },
  isVerified: { type: Boolean, default: false },
  age: { type: Number },
  position: { type: String },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
