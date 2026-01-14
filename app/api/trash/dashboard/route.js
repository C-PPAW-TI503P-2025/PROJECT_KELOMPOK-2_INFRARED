import { NextResponse } from 'next/server';
import { sequelize, ensureDbReady } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req) {
  await ensureDbReady();

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);
  const sensor_id = searchParams.get('sensor_id');

  const whereSql = sensor_id ? 'AND sensor_id = :sensor_id' : '';
  const replacements = sensor_id ? { date, sensor_id } : { date };

  // total
  const [totalRow] = await sequelize.query(
    `SELECT COALESCE(SUM(count), 0) as total
     FROM trash_entries
     WHERE date = :date ${whereSql}`,
    { replacements }
  );

  // breakdown per sensor (kalau user gak filter sensor_id)
  const bySensor = sensor_id
    ? []
    : await sequelize.query(
        `SELECT sensor_id, COALESCE(SUM(count), 0) as total
         FROM trash_entries
         WHERE date = :date
         GROUP BY sensor_id
         ORDER BY sensor_id ASC`,
        { replacements: { date } }
      ).then(([rows]) => rows);

  return NextResponse.json({
    success: true,
    data: {
      date,
      total: totalRow?.[0]?.total ?? 0,
      bySensor,
    },
  });
}
