import path from 'path';
import { Sequelize, DataTypes, Op } from 'sequelize';

export const runtime = 'nodejs';

const storage = process.env.SQLITE_PATH
  ? path.resolve(process.cwd(), process.env.SQLITE_PATH)
  : path.resolve(process.cwd(), 'data', 'trash_monitoring.db');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});

export const TrashEntry = sequelize.define(
  'TrashEntry',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sensor_id: { type: DataTypes.STRING(50), allowNull: false },
    count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    timestamp: { type: DataTypes.DATE, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    sensor_status: { type: DataTypes.TEXT, allowNull: true, defaultValue: 'active' },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: 'trash_entries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

let _readyPromise = null;
export function ensureDbReady() {
  if (!_readyPromise) {
    _readyPromise = sequelize.authenticate();
  }
  return _readyPromise;
}

export { Op };
