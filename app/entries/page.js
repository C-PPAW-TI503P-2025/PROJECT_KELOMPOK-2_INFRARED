'use client';

import { useEffect, useState } from 'react';

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID');
}

export default function EntriesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sensorId, setSensorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState({ rows: [], total: 0, page: 1, totalPages: 1 });

  async function load(p = page) {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(p), limit: String(limit) });
    if (sensorId) qs.set('sensor_id', sensorId);
    const r = await fetch(`/api/trash/entries?${qs.toString()}`, { cache: 'no-store' });
    const j = await r.json();
    setResp(j.data);
    setLoading(false);
  }

  useEffect(() => { load(1); setPage(1); }, [sensorId]);

  async function del(id) {
    if (!confirm(`Hapus entry ID ${id}?`)) return;
    const r = await fetch(`/api/trash/entries/${id}`, { method: 'DELETE' });
    const j = await r.json();
    if (!j.success) alert(j.message || 'Gagal hapus');
    load(page);
  }

  return (
    <main>
      <h1 style={{margin:"8px 0 2px"}}>Entries</h1>
      <div className="muted">Daftar data yang masuk dari sensor (pagination).</div>

      <div className="controls">
        <input
          className="input"
          placeholder="Filter sensor_id (contoh: BIN-01)"
          value={sensorId}
          onChange={(e) => setSensorId(e.target.value)}
        />
        <button className="btn secondary" onClick={() => load(1)}>Cari</button>
      </div>

      {loading ? (
        <div className="muted">Loading...</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sensor</th>
                <th>Count</th>
                <th>Timestamp</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {resp.rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.sensor_id}</td>
                  <td>{r.count}</td>
                  <td>{formatDate(r.timestamp)}</td>
                  <td>{r.date}</td>
                  <td>{r.notes || '-'}</td>
                  <td>
                    <div className="rowActions">
                      <button className="btn danger" onClick={() => del(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {resp.rows.length === 0 && (
                <tr><td colSpan={7} className="muted">Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>

          <div className="controls" style={{justifyContent:"space-between"}}>
            <div className="small">
              Total: {resp.total} entries • Page {resp.page}/{resp.totalPages}
            </div>
            <div className="controls">
              <button className="btn secondary" disabled={page <= 1} onClick={() => { const np = page - 1; setPage(np); load(np); }}>Prev</button>
              <button className="btn secondary" disabled={page >= resp.totalPages} onClick={() => { const np = page + 1; setPage(np); load(np); }}>Next</button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
