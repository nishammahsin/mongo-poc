const mongoose = require('mongoose');

const spo2DailyAverageSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  averageSpo2: {
    type: Number,
    required: true
  },
  minSpo2: {
    type: Number,
    required: true
  },
  maxSpo2: {
    type: Number,
    required: true
  },
  readingsCount: {
    type: Number,
    required: true
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient querying
spo2DailyAverageSchema.index({ patientId: 1, date: 1 }, { unique: true });

const Spo2DailyAverage = mongoose.model('Spo2DailyAverage', spo2DailyAverageSchema);

module.exports = Spo2DailyAverage; 