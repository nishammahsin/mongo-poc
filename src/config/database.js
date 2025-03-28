const mongoose = require('mongoose');
require('dotenv').config();

const initTimeSeriesCollection = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Check if collection exists
    const collections = await db.listCollections({ name: 'spo2readings' }).toArray();
    
    if (collections.length === 0) {
      // Create time series collection if it doesn't exist
      await db.createCollection('spo2readings', {
        timeseries: {
          timeField: 'timestamp',
          metaField: 'patientId',
          granularity: 'seconds',
        },
        expireAfterSeconds: 7776000 // 90 days retention
      });
      
      console.log('Time series collection created successfully');
      
      // Create indexes
      await db.collection('spo2readings').createIndex({ 'patientId': 1, 'timestamp': -1 });
    }
  } catch (error) {
    console.error('Error initializing time series collection:', error);
    throw error;
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    
    // Initialize time series collection
    await initTimeSeriesCollection();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 