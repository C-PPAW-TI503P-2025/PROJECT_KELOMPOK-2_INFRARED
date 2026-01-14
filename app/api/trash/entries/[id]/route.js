import { NextResponse } from 'next/server';
import { TrashEntry, ensureDbReady } from '@/lib/db';

export const runtime = 'nodejs';

export async function DELETE(_req, { params }) {
  await ensureDbReady();

  const id = params?.id;
  if (!id) return NextResponse.json({ success: false, message: 'id required' }, { status: 400 });

  const found = await TrashEntry.findByPk(id);
  if (!found) return NextResponse.json({ success: false, message: 'Entry not found' }, { status: 404 });

  await found.destroy();
  return NextResponse.json({ success: true, message: 'Entry deleted' });
}
