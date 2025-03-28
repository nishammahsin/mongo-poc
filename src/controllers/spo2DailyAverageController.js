const Spo2DailyAverageService = require('../services/spo2DailyAverageService');

class Spo2DailyAverageController {
  // Trigger daily average calculation manually
  static async calculateDailyAverages(req, res) {
    try {
      const results = await Spo2DailyAverageService.calculateRecentDailyAverages();
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get stored daily average for a patient
  static async getStoredDailyAverage(req, res) {
    try {
      const { patientId, date } = req.query;
      
      if (!patientId || !date) {
        return res.status(400).json({
          success: false,
          error: 'patientId and date are required'
        });
      }

      const average = await Spo2DailyAverageService.getStoredDailyAverage(patientId, new Date(date));
      
      res.json({
        success: true,
        data: average
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = Spo2DailyAverageController; 