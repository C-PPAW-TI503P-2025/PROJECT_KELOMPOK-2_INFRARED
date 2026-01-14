'use client';

import { useEffect, useMemo, useState } from 'react';

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID');
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const [s1, s2] = await Promise.all([
        fetch('/api/trash/dashboard', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/trash/statistics?days=7', { cache: 'no-store' }).then(r => r.json()),
      ]);
      setSummary(s1.data);
      setStats(s2.data?.series || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // auto-refresh tiap 5 detik
    return () => clearInterval(t);
  }, []);

  const total7 = useMemo(() => stats.reduce((a, x) => a + (x.total || 0), 0), [stats]);

  return (
    <main>
      <h1 style={{margin:"8px 0 2px"}}>Dashboard</h1>
      <div className="muted">Monitoring tempat sampah berbasis sensor IR (auto refresh 5 detik).</div>

      {loading && <div style={{marginTop:12}} className="muted">Loading...</div>}

      {summary && (
        <section style={{marginTop:14}} className="cardGrid">
          <div className="card">
            <div className="muted">Total Hari Ini</div>
            <div className="kpi">{summary.todayTotal}</div>
            <div className="small">Tanggal: {summary.todayDate}</div>
          </div>
          <div className="card">
            <div className="muted">Total 7 Hari</div>
            <div className="kpi">{total7}</div>
            <div className="small">Range: {summary.range7?.start} → {summary.range7?.end}</div>
          </div>
          <div className="card">
            <div className="muted">Total Entries</div>
            <div className="kpi">{summary.totalEntries}</div>
            <div className="small">Last entry: {formatDate(summary.lastEntryAt)}</div>
          </div>
          <div className="card">
            <div className="muted">Sensor Aktif (distinct)</div>
            <div className="kpi">{summary.activeSensors}</div>
            <div className="small">Distinct sensor_id yang pernah ngirim data</div>
          </div>
        </section>
      )}

      <section style={{marginTop:14}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h2 style={{margin:"8px 0"}}>Statistik 7 Hari Terakhir</h2>
          <button className="btn secondary" onClick={load}>Refresh</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Total Sampah</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((r) => (
              <tr key={r.date}>
                <td>{r.date}</td>
                <td>{r.total}</td>
              </tr>
            ))}
            {stats.length === 0 && (
              <tr><td colSpan={2} className="muted">Belum ada data.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
