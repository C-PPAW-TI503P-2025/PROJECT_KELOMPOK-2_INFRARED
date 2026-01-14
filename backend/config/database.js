const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Gunakan SQLite untuk development (lebih mudah, tidak perlu setup MySQL)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../trash_monitoring.db'),
  logging: false
});

// Jika mau pakai MySQL, uncomment code di bawah dan comment code SQLite di atas
/*
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);
*/

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };
