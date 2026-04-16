const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  caseId: { type: String },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  animalType: { type: String },
  severity: { type: String },
  address: { type: String },
  description: { type: String },
  status: { type: String, default: 'closed' },
  resolvedAt: { type: Date, default: Date.now },
  creditsEarned: { type: Number, default: 0 }
});

module.exports = mongoose.model('Case', caseSchema);
