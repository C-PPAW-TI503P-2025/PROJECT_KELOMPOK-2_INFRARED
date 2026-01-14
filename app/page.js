'use client';

import { useEffect, useMemo, useState } from 'react';

function formatDateTime(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID');
}

function formatDate(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return String(d);
  }
}

function buildLinePath(values, w, h, pad = 12) {
  if (!values || values.length === 0) return '';
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(1, max - min);
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  return values
    .map((v, i) => {
      const x = pad + (innerW * (values.length === 1 ? 0 : i / (values.length - 1)));
      const y = pad + innerH - (innerH * ((v - min) / span));
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState([]);
  const [latest, setLatest] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const [s1, s2, s3] = await Promise.all([
        fetch('/api/trash/dashboard', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/trash/statistics?days=7', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/trash/entries?limit=20&page=1', { cache: 'no-store' }).then(r => r.json()),
      ]);

      setSummary(s1?.data || null);
      setStats(s2?.data?.rows || []);
      setLatest(s3?.data?.rows || []);
    } catch (e) {
      console.error(e);
      setSummary(null);
      setStats([]);
      setLatest([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const todayISO = summary?.todayDate || new Date().toISOString().slice(0, 10);

  const todayBySensor = useMemo(() => {
    const map = new Map();
    for (const row of latest) {
      const d = String(row.createdAt || '').slice(0, 10);
      if (d !== todayISO) continue;
      const id = row.sensor_id || 'UNKNOWN';
      map.set(id, (map.get(id) || 0) + Number(row.count || 0));
    }
    const arr = Array.from(map.entries()).map(([sensor_id, total]) => ({ sensor_id, total }));
    arr.sort((a, b) => b.total - a.total);
    return arr.slice(0, 6);
  }, [latest, todayISO]);

  const chart = useMemo(() => {
    const labels = stats.map(r => r.date);
    const values = stats.map(r => Number(r.total || 0));
    const W = 640;
    const H = 170;
    return {
      labels,
      values,
      path: buildLinePath(values, W, H, 14),
      W,
      H,
      max: values.length ? Math.max(...values) : 0,
      min: values.length ? Math.min(...values) : 0,
    };
  }, [stats]);

  const lastEntry = latest?.[0] || null;

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="grid cols-3">
        <section className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">AGENT ALLOCATION</div>
              <div className="panelSub">Aktivitas sensor hari ini</div>
            </div>
            <span className="badge">TODAY</span>
          </div>
          <div className="kpiRow">
            <div style={{ flex: 1, minWidth: 140 }}>
              <div className="bigNumber">{summary?.todayTotal ?? (loading ? '...' : 0)}</div>
              <div className="muted" style={{ fontSize: 12, letterSpacing: '.12em' }}>ITEMS DETECTED</div>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div className="bigNumber">{summary?.activeSensors ?? (loading ? '...' : 0)}</div>
              <div className="muted" style={{ fontSize: 12, letterSpacing: '.12em' }}>ACTIVE SENSORS</div>
            </div>
          </div>

          <div className="hr" />

          <div className="muted" style={{ fontSize: 12, letterSpacing: '.12em', marginBottom: 8 }}>TOP SENSORS</div>
          <div className="grid" style={{ gap: 10 }}>
            {todayBySensor.length === 0 && (
              <div className="muted" style={{ fontSize: 13 }}>
                Belum ada data sensor hari ini.
              </div>
            )}
            {todayBySensor.map((s) => (
              <div key={s.sensor_id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', letterSpacing: '.08em' }}>
                  {s.sensor_id}
                </span>
                <span className="muted">{s.total}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">ACTIVITY LOG</div>
              <div className="panelSub">Entry terbaru (auto refresh)</div>
            </div>
            <span className="muted" style={{ fontSize: 12, letterSpacing: '.12em' }}>
              Last: {formatDateTime(summary?.lastEntryAt)}
            </span>
          </div>

          <div className="scrollBox">
            {latest.length === 0 && !loading && (
              <div className="muted">Belum ada entries.</div>
            )}
            {latest.slice(0, 10).map((row) => (
              <div className="logItem" key={row.id}>
                <div className="logTime">{formatDateTime(row.createdAt)}</div>
                <div className="logText">
                  Sensor <b>{row.sensor_id || 'UNKNOWN'}</b> mendeteksi <b>{row.count ?? 0}</b> item
                </div>
                {row.notes ? <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>{row.notes}</div> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">REALTIME FEED</div>
              <div className="panelSub">Payload terakhir (debug IoT)</div>
            </div>
            <span className="badge">SECURE</span>
          </div>

          <div style={{
            border: '1px solid rgba(255,255,255,.06)',
            background: 'rgba(0,0,0,.18)',
            borderRadius: 16,
            padding: 12,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 12,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            color: 'rgba(232,232,234,.9)'
          }}>
            {loading && '... loading'}
            {!loading && !lastEntry && 'No data.'}
            {!loading && lastEntry && JSON.stringify({
              id: lastEntry.id,
              sensor_id: lastEntry.sensor_id,
              count: lastEntry.count,
              notes: lastEntry.notes,
              createdAt: lastEntry.createdAt,
            }, null, 2)}
          </div>
        </section>
      </div>

      <div className="grid cols-2">
        <section className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">WASTE ACTIVITY OVERVIEW</div>
              <div className="panelSub">Total per hari (7 hari terakhir)</div>
            </div>
            <div className="kpiChip">
              Range: {summary?.range7?.start || '-'} → {summary?.range7?.end || '-'}
            </div>
          </div>

          <svg className="svgChart" viewBox={`0 0 ${chart.W} ${chart.H}`} preserveAspectRatio="none">
            <path d={chart.path} fill="none" stroke="var(--accent)" strokeWidth="3" />
            {/* baseline */}
            <path d={`M 0 ${chart.H-1} L ${chart.W} ${chart.H-1}`} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1" />
          </svg>

          <table className="table" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.length === 0 && !loading && (
                <tr><td colSpan={2} className="muted">Belum ada data statistik.</td></tr>
              )}
              {stats.map((r) => (
                <tr key={r.date}>
                  <td>{formatDate(r.date)}</td>
                  <td>{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">MISSION INFORMATION</div>
              <div className="panelSub">Ringkasan sistem</div>
            </div>
            <span className="badge">SUMMARY</span>
          </div>

          <div className="grid" style={{ gap: 12 }}>
            <div className="kpiChip">Total Entries: <b style={{ color: 'var(--accent2)' }}>{summary?.totalEntries ?? (loading ? '...' : 0)}</b></div>
            <div className="kpiChip">Today Total: <b style={{ color: 'var(--accent2)' }}>{summary?.todayTotal ?? (loading ? '...' : 0)}</b></div>
            <div className="kpiChip">Active Sensors: <b style={{ color: 'var(--accent2)' }}>{summary?.activeSensors ?? (loading ? '...' : 0)}</b></div>
            <div className="kpiChip">Last Entry: <b style={{ color: 'var(--accent2)' }}>{formatDateTime(summary?.lastEntryAt)}</b></div>
          </div>

          <div className="hr" />

          <div className="muted" style={{ fontSize: 12 }}>
            Kalau lo mau integrasi ESP32: kirim JSON ke <code>POST /api/trash/entries</code>. Dashboard auto refresh tiap 5 detik.
          </div>
        </section>
      </div>
    </div>
  );
}
