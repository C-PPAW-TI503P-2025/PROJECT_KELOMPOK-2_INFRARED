import { NextResponse } from 'next/server';
import { TrashEntry, ensureDbReady } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req) {
  await ensureDbReady();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const sensor_id = searchParams.get('sensor_id');

  const where = {};
  if (sensor_id) where.sensor_id = sensor_id;

  const offset = (page - 1) * limit;

  const { rows, count } = await TrashEntry.findAndCountAll({
    where,
    order: [['timestamp', 'DESC']],
    limit,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(count / limit));

  return NextResponse.json({
    success: true,
    data: {
      rows,
      total: count,
      page,
      totalPages,
      limit,
    },
  });
}

export async function POST(req) {
  await ensureDbReady();

  try {
    const body = await req.json();
    const { sensor_id, notes, count } = body || {};

    if (!sensor_id) {
      return NextResponse.json({ success: false, message: 'sensor_id is required' }, { status: 400 });
    }

    const now = new Date();
    const entry = await TrashEntry.create({
      sensor_id,
      notes: notes ?? null,
      count: Number.isFinite(+count) && +count > 0 ? +count : 1,
      timestamp: now.toISOString(),
      date: now.toISOString().slice(0, 10),
      sensor_status: 'active',
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: 'Error recording trash entry', error: e?.message },
      { status: 500 }
    );
  }
}
