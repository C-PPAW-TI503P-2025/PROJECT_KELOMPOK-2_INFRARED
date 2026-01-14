const express = require('express');
const router = express.Router();
const {
  addTrashEntry,
  getDailyCount,
  getStatistics,
  getAllEntries,
  getDashboardSummary,
  deleteEntry
} = require('../controllers/trashController');

// POST - Tambah entry baru (dipanggil oleh sensor)
router.post('/entries', addTrashEntry);

// GET - Ambil data per hari
router.get('/daily', getDailyCount);

// GET - Ambil statistik
router.get('/statistics', getStatistics);

// GET - Ambil semua entries dengan pagination
router.get('/entries', getAllEntries);

// GET - Dashboard summary
router.get('/dashboard', getDashboardSummary);

// DELETE - Hapus entry
router.delete('/entries/:id', deleteEntry);

module.exports = router;
