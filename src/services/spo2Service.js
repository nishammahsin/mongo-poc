const Spo2Reading = require('../models/Spo2Reading');

class Spo2Service {
  // Insert a new SPO2 reading
  static async insertReading(patientId, spo2Value, timestamp = new Date()) {
    try {
      const reading = new Spo2Reading({
        patientId,
        spo2Value,
        timestamp
      });
      return await reading.save();
    } catch (error) {
      throw error;
    }
  }

  // Calculate daily average for a specific day and patient
  static async calculateDailyAverage(patientId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const result = await Spo2Reading.aggregate([
        {
          $match: {
            patientId: patientId,
            timestamp: {
              $gte: startOfDay,
              $lte: endOfDay
            }
          }
        },
        {
          $group: {
            _id: {
              patientId: "$patientId",
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$timestamp"
                }
              }
            },
            averageSpo2: { $avg: "$spo2Value" },
            minSpo2: { $min: "$spo2Value" },
            maxSpo2: { $max: "$spo2Value" },
            readingsCount: { $sum: 1 },
            readings: { 
              $push: {
                spo2Value: "$spo2Value",
                timestamp: "$timestamp"
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            patientId: "$_id.patientId",
            date: "$_id.date",
            averageSpo2: { $round: ["$averageSpo2", 2] },
            minSpo2: 1,
            maxSpo2: 1,
            readingsCount: 1,
            readings: { $slice: ["$readings", 10] } // Return last 10 readings as sample
          }
        }
      ]);

      return result[0] || {
        patientId,
        date: new Date(date).toISOString().split('T')[0],
        averageSpo2: null,
        minSpo2: null,
        maxSpo2: null,
        readingsCount: 0,
        readings: []
      };
    } catch (error) {
      throw error;
    }
  }

  // Simulate data ingestion (in real scenario, this would be Kinesis)
  static async simulateDataIngestion(patientId, numberOfReadings = 1) {
    try {
      const readings = [];
      const baseTime = Date.now();
      
      for (let i = 0; i < numberOfReadings; i++) {
        // Generate more realistic SPO2 values (normal range is 95-100)
        const spo2Value = Math.floor(Math.random() * (100 - 95 + 1)) + 95;
        // One reading per second, going backwards from now
        const timestamp = new Date(baseTime - (i * 1000));
        
        readings.push({
          patientId,
          spo2Value,
          timestamp
        });
      }
      
      const savedReadings = await Spo2Reading.insertMany(readings);
      
      // Return formatted readings
      return {
        patientId,
        numberOfReadings: savedReadings.length,
        timeRange: {
          start: savedReadings[savedReadings.length - 1].timestamp,
          end: savedReadings[0].timestamp
        },
        readings: savedReadings.map(r => ({
          spo2Value: r.spo2Value,
          timestamp: r.timestamp,
          id: r._id
        }))
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Spo2Service; 