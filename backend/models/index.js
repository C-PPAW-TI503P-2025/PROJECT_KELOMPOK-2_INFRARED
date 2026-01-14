const { sequelize } = require('../config/database');
const TrashEntry = require('./TrashEntry');

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
  }
};

module.exports = {
  TrashEntry,
  syncDatabase
};
