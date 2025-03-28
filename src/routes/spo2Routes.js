const express = require('express');
const Spo2Controller = require('../controllers/spo2Controller');
const Spo2DailyAverageController = require('../controllers/spo2DailyAverageController');

const router = express.Router();

// Route to simulate data ingestion
router.post('/simulate-ingestion', Spo2Controller.simulateDataIngestion);

// Route to get real-time daily average calculation
router.get('/daily-average', Spo2Controller.getDailyAverage);

// Routes for stored daily averages
router.post('/calculate-daily-averages', Spo2DailyAverageController.calculateDailyAverages);
router.get('/stored-daily-average', Spo2DailyAverageController.getStoredDailyAverage);

module.exports = router; 