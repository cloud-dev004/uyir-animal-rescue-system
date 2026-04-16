const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  caseId:        { type: String, unique: true }, // UYR-2024-00123
  location: {
    type:        { type: String, default: 'Point' },
    coordinates: [Number]
  },
  address:       { type: String },
  city:          { type: String },
  area:          { type: String },
  animalType:    { type: String, enum: ['dog', 'cat', 'cow', 'bird', 'other'] },
  description:   { type: String },
  photos:        [{ type: String }], // Cloudinary URLs
  severity:      { type: String, enum: ['mild', 'moderate', 'critical'], default: 'moderate' },
  status:        { 
                   type: String, 
                   enum: ['open', 'assigned', 'en-route', 'rescued', 'treated', 'adopted', 'closed'], 
                   default: 'open' 
                 },
  reportedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporterPhone: { type: String }, // For anonymous reports
  assignedTo:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vetClinic:     { type: mongoose.Schema.Types.ObjectId, ref: 'VetClinic' },
  resolvedAt:    { type: Date },
  createdAt:     { type: Date, default: Date.now }
});

reportSchema.index({ location: '2dsphere' });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
