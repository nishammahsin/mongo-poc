const mongoose = require('mongoose');

const spo2ReadingSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  spo2Value: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, {
  // Specify the collection name explicitly
  collection: 'spo2readings'
});

// Create compound index for efficient querying
spo2ReadingSchema.index({ patientId: 1, timestamp: -1 });

const Spo2Reading = mongoose.model('Spo2Reading', spo2ReadingSchema);

module.exports = Spo2Reading;