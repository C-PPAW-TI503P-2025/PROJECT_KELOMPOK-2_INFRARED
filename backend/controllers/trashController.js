const { TrashEntry } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Tambah data sampah baru (dipanggil saat sensor mendeteksi)
const addTrashEntry = async (req, res) => {
  try {
    const { sensor_id, notes } = req.body;
    
    if (!sensor_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sensor ID is required' 
      });
    }

    const entry = await TrashEntry.create({
      sensor_id,
      count: 1,
      date: new Date().toISOString().split('T')[0],
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Trash entry recorded successfully',
      data: entry
    });
  } catch (error) {
    console.error('Error adding trash entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording trash entry',
      error: error.message
    });
  }
};

// Get total sampah per hari
const getDailyCount = async (req, res) => {
  try {
    const { date, sensor_id } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const whereClause = { date: targetDate };
    if (sensor_id) {
      whereClause.sensor_id = sensor_id;
    }

    const entries = await TrashEntry.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']]
    });

    const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);

    res.json({
      success: true,
      date: targetDate,
      total_count: totalCount,
      entries_count: entries.length,
      data: entries
    });
  } catch (error) {
    console.error('Error getting daily count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily count',
      error: error.message
    });
  }
};

// Get statistik per range tanggal
const getStatistics = async (req, res) => {
  try {
    const { start_date, end_date, sensor_id } = req.query;
    
    const whereClause = {};
    if (start_date && end_date) {
      whereClause.date = {
        [Op.between]: [start_date, end_date]
      };
    }
    if (sensor_id) {
      whereClause.sensor_id = sensor_id;
    }

    const statistics = await TrashEntry.findAll({
      attributes: [
        'date',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_entries'],
        [sequelize.fn('SUM', sequelize.col('count')), 'total_trash']
      ],
      where: whereClause,
      group: ['date'],
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// Get semua entries dengan pagination
const getAllEntries = async (req, res) => {
  try {
    const { page = 1, limit = 50, sensor_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (sensor_id) {
      whereClause.sensor_id = sensor_id;
    }

    const { count, rows } = await TrashEntry.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']]
    });

    res.json({
      success: true,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(count / limit),
      data: rows
    });
  } catch (error) {
    console.error('Error getting entries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching entries',
      error: error.message
    });
  }
};

// Get summary untuk dashboard
const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Total hari ini
    const todayEntries = await TrashEntry.findAll({
      where: { date: today }
    });
    const todayCount = todayEntries.reduce((sum, entry) => sum + entry.count, 0);

    // Total keseluruhan
    const totalEntries = await TrashEntry.findAll();
    const totalCount = totalEntries.reduce((sum, entry) => sum + entry.count, 0);

    // 7 hari terakhir
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyData = await TrashEntry.findAll({
      attributes: [
        'date',
        [sequelize.fn('SUM', sequelize.col('count')), 'total']
      ],
      where: {
        date: {
          [Op.gte]: sevenDaysAgo.toISOString().split('T')[0]
        }
      },
      group: ['date'],
      order: [['date', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        today: {
          date: today,
          count: todayCount,
          entries: todayEntries.length
        },
        total: {
          count: totalCount,
          entries: totalEntries.length
        },
        weekly: weeklyData
      }
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message
    });
  }
};

// Delete entry
const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    
    const entry = await TrashEntry.findByPk(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    await entry.destroy();
    
    res.json({
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting entry',
      error: error.message
    });
  }
};

module.exports = {
  addTrashEntry,
  getDailyCount,
  getStatistics,
  getAllEntries,
  getDashboardSummary,
  deleteEntry
};
