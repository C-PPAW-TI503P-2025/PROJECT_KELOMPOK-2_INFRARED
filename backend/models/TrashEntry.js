const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TrashEntry = sequelize.define('TrashEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sensor_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'ID sensor IR yang mendeteksi'
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Jumlah sampah yang terdeteksi'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Waktu deteksi sampah'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Tanggal untuk grouping per hari'
  },
  sensor_status: {
    type: DataTypes.ENUM('active', 'inactive', 'error'),
    defaultValue: 'active',
    comment: 'Status sensor'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Catatan tambahan'
  }
}, {
  tableName: 'trash_entries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['date']
    },
    {
      fields: ['sensor_id']
    },
    {
      fields: ['timestamp']
    }
  ]
});

module.exports = TrashEntry;
