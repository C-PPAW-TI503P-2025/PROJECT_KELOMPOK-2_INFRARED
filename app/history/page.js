'use client';

import { useEffect, useMemo, useState } from 'react';

export default function HistoryPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [sensorId, setSensorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set('date', date);
    if (sensorId.trim()) p.set('sensor_id', sensorId.trim());
    return p.toString();
  }, [date, sensorId]);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/trash/daily?' + query, { cache: 'no-store' }).then(res => res.json());
      setDaily(r?.data || null);
    } catch (e) {
      console.error(e);
      setDaily(null);
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
            <div className="panelTitle">INTELLIGENCE</div>
            <div className="panelSub">Total per hari (filter tanggal + sensor)</div>
          </div>
          <span className="badge">DAILY</span>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <div className="kpiChip" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: 12, letterSpacing: '.12em' }}>DATE</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                background: 'rgba(0,0,0,.2)',
                border: '1px solid rgba(255,255,255,.10)',
                color: 'var(--text)',
                borderRadius: 12,
                padding: '8px 10px',
                outline: 'none',
              }}
            />
          </div>

          <div className="kpiChip" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: 12, letterSpacing: '.12em' }}>SENSOR_ID</span>
            <input
              value={sensorId}
              onChange={(e) => setSensorId(e.target.value)}
              placeholder="opsional, contoh: BIN-01"
              style={{
                background: 'rgba(0,0,0,.2)',
                border: '1px solid rgba(255,255,255,.10)',
                color: 'var(--text)',
                borderRadius: 12,
                padding: '8px 10px',
                outline: 'none',
                minWidth: 240,
              }}
            />
          </div>

          <button className="kpiChip" style={{ cursor: 'pointer' }} onClick={() => load()}>
            Refresh
          </button>
        </div>

        <div className="grid cols-2">
          <div className="panel" style={{ padding: 14 }}>
            <div className="panelTitle">RESULT</div>
            <div className="hr" />
            {loading && <div className="muted">Loading...</div>}
            {!loading && !daily && <div className="muted">Tidak ada data.</div>}
            {!loading && daily && (
              <div className="grid" style={{ gap: 10 }}>
                <div className="kpiChip">Date: <b style={{ color: 'var(--accent2)' }}>{daily.date}</b></div>
                <div className="kpiChip">Sensor: <b style={{ color: 'var(--accent2)' }}>{daily.sensor_id || 'ALL'}</b></div>
                <div className="kpiChip">Total: <b style={{ color: 'var(--accent2)' }}>{daily.total}</b></div>
              </div>
            )}
          </div>

          <div className="panel" style={{ padding: 14 }}>
            <div className="panelTitle">NOTES</div>
            <div className="hr" />
            <div className="muted" style={{ lineHeight: 1.7 }}>
              Endpoint ini cocok buat laporan “hari ini vs kemarin”.
              Kalau mau grafik 7 hari, balik ke <b>Dashboard</b> (Overview).
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
