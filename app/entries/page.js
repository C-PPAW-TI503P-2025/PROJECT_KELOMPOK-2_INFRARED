'use client';

import { useEffect, useMemo, useState } from 'react';

function formatDateTime(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID');
}

export default function EntriesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sensorId, setSensorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState({ rows: [], page: 1, totalPages: 1, totalRows: 0 });

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('limit', String(limit));
    if (sensorId.trim()) p.set('sensor_id', sensorId.trim());
    return p.toString();
  }, [page, limit, sensorId]);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/trash/entries?' + query, { cache: 'no-store' }).then(res => res.json());
      const data = r?.data || {};
      setResp({
        rows: data.rows || [],
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        totalRows: data.totalRows || 0,
      });
    } catch (e) {
      console.error(e);
      setResp({ rows: [], page: 1, totalPages: 1, totalRows: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [query]);

  return (
    <div className="grid" style={{ gap: 14 }}>
      <section className="panel">
        <div className="panelHeader">
          <div>
            <div className="panelTitle">OPERATIONS</div>
            <div className="panelSub">Daftar entries (pagination + filter sensor)</div>
          </div>
          <span className="badge">ENTRIES</span>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <div className="kpiChip" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: 12, letterSpacing: '.12em' }}>SENSOR_ID</span>
            <input
              value={sensorId}
              onChange={(e) => { setPage(1); setSensorId(e.target.value); }}
              placeholder="contoh: BIN-01"
              style={{
                background: 'rgba(0,0,0,.2)',
                border: '1px solid rgba(255,255,255,.10)',
                color: 'var(--text)',
                borderRadius: 12,
                padding: '8px 10px',
                outline: 'none',
                minWidth: 220,
              }}
            />
          </div>

          <div className="kpiChip">
            Total Rows: <b style={{ color: 'var(--accent2)' }}>{loading ? '...' : resp.totalRows}</b>
          </div>

          <div className="kpiChip">
            Page: <b style={{ color: 'var(--accent2)' }}>{resp.page}</b> / {resp.totalPages}
          </div>

          <button
            onClick={() => load()}
            className="kpiChip"
            style={{ cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sensor</th>
              <th>Count</th>
              <th>Notes</th>
              <th>CreatedAt</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="muted">Loading...</td></tr>
            )}
            {!loading && resp.rows.length === 0 && (
              <tr><td colSpan={5} className="muted">Tidak ada data.</td></tr>
            )}
            {!loading && resp.rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', letterSpacing: '.06em' }}>
                  {r.sensor_id || 'UNKNOWN'}
                </td>
                <td>{r.count ?? 0}</td>
                <td className="muted">{r.notes || '-'}</td>
                <td>{formatDateTime(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            className="kpiChip"
            style={{ cursor: resp.page <= 1 ? 'not-allowed' : 'pointer', opacity: resp.page <= 1 ? .5 : 1 }}
            disabled={resp.page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            className="kpiChip"
            style={{ cursor: resp.page >= resp.totalPages ? 'not-allowed' : 'pointer', opacity: resp.page >= resp.totalPages ? .5 : 1 }}
            disabled={resp.page >= resp.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
