const Spo2Service = require('../services/spo2Service');

class Spo2Controller {
  // Simulate data ingestion
  static async simulateDataIngestion(req, res) {
    try {
      const { patientId, numberOfReadings } = req.body;
      const readings = await Spo2Service.simulateDataIngestion(patientId, numberOfReadings);
      res.json({ success: true, readings });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get daily average
  static async getDailyAverage(req, res) {
    try {
      const { patientId, date } = req.query;
      const average = await Spo2Service.calculateDailyAverage(patientId, new Date(date));
      res.json({ success: true, data: average });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = Spo2Controller; 