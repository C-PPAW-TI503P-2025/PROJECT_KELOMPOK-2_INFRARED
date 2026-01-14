'use client';

import { useEffect, useMemo, useState } from 'react';

export default function HistoryPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [sensorId, setSensorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState(null);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams({ date });
    if (sensorId) qs.set('sensor_id', sensorId);
    const r = await fetch(`/api/trash/daily?${qs.toString()}`, { cache: 'no-store' });
    const j = await r.json();
    setDaily(j.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [date, sensorId]);

  const total = useMemo(() => daily?.total || 0, [daily]);

  return (
    <main>
      <h1 style={{margin:"8px 0 2px"}}>Data Per Hari</h1>
      <div className="muted">Lihat total sampah untuk tanggal tertentu (bisa filter sensor).</div>

      <div className="controls">
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input
          className="input"
          placeholder="Filter sensor_id (opsional)"
          value={sensorId}
          onChange={(e) => setSensorId(e.target.value)}
        />
        <button className="btn secondary" onClick={load}>Refresh</button>
      </div>

      {loading ? (
        <div className="muted">Loading...</div>
      ) : (
        <section className="cardGrid">
          <div className="card">
            <div className="muted">Tanggal</div>
            <div className="kpi" style={{fontSize:22}}>{daily?.date}</div>
            <div className="small">Filter sensor: {sensorId || 'Semua'}</div>
          </div>
          <div className="card">
            <div className="muted">Total Sampah</div>
            <div className="kpi">{total}</div>
            <div className="small">Sum(count) untuk tanggal tersebut</div>
          </div>
          <div className="card">
            <div className="muted">Breakdown per Sensor</div>
            <div className="small">
              {daily?.bySensor?.length ? (
                <ul style={{margin:"10px 0 0", paddingLeft:16}}>
                  {daily.bySensor.map((x) => (
                    <li key={x.sensor_id}>{x.sensor_id}: <b>{x.total}</b></li>
                  ))}
                </ul>
              ) : (
                <span className="muted">Tidak ada data.</span>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
