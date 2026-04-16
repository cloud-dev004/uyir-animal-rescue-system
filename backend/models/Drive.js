const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
  type:          { type: String, enum: ['ABC', 'vaccination', 'adoption-camp'] },
  ward:          { type: String, required: true },
  district:      { type: String, required: true },
  location: {
    type:        { type: String, default: 'Point' },
    coordinates: [Number]
  },
  scheduledDate: { type: Date, required: true },
  organiser:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  volunteers:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  targetCount:   { type: Number },
  actualCount:   { type: Number, default: 0 },
  status:        { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' }
});

module.exports = mongoose.model('Drive', driveSchema);
