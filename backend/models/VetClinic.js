const mongoose = require('mongoose');

const vetClinicSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  phone:         { type: String, required: true },
  location: {
    type:        { type: String, default: 'Point' },
    coordinates: [Number]
  },
  address:       { type: String },
  specializations: [{ type: String }], // dogs, cats, large-animals
  capacity:      { type: Number, default: 5 },
  managedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:      { type: Boolean, default: true }
});

vetClinicSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('VetClinic', vetClinicSchema);
