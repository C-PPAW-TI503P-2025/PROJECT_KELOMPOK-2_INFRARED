import { NextResponse } from 'next/server';
import { sequelize, ensureDbReady } from '@/lib/db';

export const runtime = 'nodejs';

function addDays(dateStr, delta) {
  const d = new Date(dateStr + 'T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export async function GET(req) {
  await ensureDbReady();

  const { searchParams } = new URL(req.url);
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get('days') || '7', 10)));
  const sensor_id = searchParams.get('sensor_id');

  const end = new Date().toISOString().slice(0, 10);
  const start = addDays(end, -(days - 1));

  const whereSql = sensor_id ? 'AND sensor_id = :sensor_id' : '';
  const replacements = sensor_id ? { start, end, sensor_id } : { start, end };

  const [rows] = await sequelize.query(
    `SELECT date, COALESCE(SUM(count), 0) as total
     FROM trash_entries
     WHERE date BETWEEN :start AND :end ${whereSql}
     GROUP BY date
     ORDER BY date ASC`,
    { replacements }
  );

  // biar tanggal yang gak ada data tetap muncul (0)
  const map = new Map(rows.map(r => [r.date, Number(r.total || 0)]));
  const series = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    series.push({ date: d, total: map.get(d) ?? 0 });
  }

  return NextResponse.json({
    success: true,
    data: { start, end, days, series },
  });
}
