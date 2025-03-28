const Spo2Reading = require('../models/Spo2Reading');
const Spo2DailyAverage = require('../models/Spo2DailyAverage');

class Spo2DailyAverageService {
  static async calculateAndStoreDailyAverages(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      // Get all unique patient IDs for the given day
      const patients = await Spo2Reading.distinct('patientId', {
        timestamp: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });

      const results = [];

      // Calculate averages for each patient
      for (const patientId of patients) {
        const dailyStats = await Spo2Reading.aggregate([
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
              readingsCount: { $sum: 1 }
            }
          }
        ]);

        if (dailyStats.length > 0) {
          const stats = dailyStats[0];
          
          // Upsert daily average
          await Spo2DailyAverage.findOneAndUpdate(
            {
              patientId: patientId,
              date: startOfDay
            },
            {
              patientId: patientId,
              date: startOfDay,
              averageSpo2: Math.round(stats.averageSpo2 * 100) / 100,
              minSpo2: stats.minSpo2,
              maxSpo2: stats.maxSpo2,
              readingsCount: stats.readingsCount,
              calculatedAt: new Date()
            },
            {
              upsert: true,
              new: true
            }
          );

          results.push({
            patientId,
            date: startOfDay,
            averageSpo2: Math.round(stats.averageSpo2 * 100) / 100,
            minSpo2: stats.minSpo2,
            maxSpo2: stats.maxSpo2,
            readingsCount: stats.readingsCount
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error calculating daily averages:', error);
      throw error;
    }
  }

  // Get stored daily average for a patient
  static async getStoredDailyAverage(patientId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    try {
      const average = await Spo2DailyAverage.findOne({
        patientId,
        date: startOfDay
      });

      return average || null;
    } catch (error) {
      console.error('Error fetching stored daily average:', error);
      throw error;
    }
  }

  // Calculate averages for today and yesterday
  static async calculateRecentDailyAverages() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      console.log('Calculating daily averages for:', yesterday.toISOString().split('T')[0]);
      const yesterdayResults = await this.calculateAndStoreDailyAverages(yesterday);
      
      console.log('Calculating daily averages for:', today.toISOString().split('T')[0]);
      const todayResults = await this.calculateAndStoreDailyAverages(today);

      return {
        yesterday: yesterdayResults,
        today: todayResults
      };
    } catch (error) {
      console.error('Error calculating recent daily averages:', error);
      throw error;
    }
  }
}

module.exports = Spo2DailyAverageService; 