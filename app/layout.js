import './globals.css';
import NavLinks from './components/NavLinks';

export const metadata = {
  title: 'Trash Ops — IR Sensor Monitoring',
  description: 'Dashboard monitoring tempat sampah berbasis sensor IR (Next.js + SQLite)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <div className="appShell">
          <aside className="sidebar">
            <div className="brand">
              <div className="brandTitle">TRASH OPS</div>
              <div className="brandSub">v1.0 • CLASSIFIED</div>
            </div>

            <div className="sectionTitle">NAVIGATION</div>
            <NavLinks />

            <div className="statusCard">
              <div className="statusRow">
                <span className="statusPill"><span className="pulse" /> SYSTEM ONLINE</span>
              </div>
              <div className="statusMeta">
                <div><span className="muted">DB</span> SQLite</div>
                <div><span className="muted">API</span> /api/trash/*</div>
              </div>
            </div>
          </aside>

          <div className="main">
            <header className="topbar">
              <div className="breadcrumb">TRASH COMMAND / <span className="accent">OVERVIEW</span></div>
              <div className="topbarRight">
                <span className="muted">LIVE</span> <span className="liveDot" />
              </div>
            </header>

            <div className="content">
              {children}
            </div>

            <footer className="footer">
              <span className="muted">Tip:</span> endpoint IoT untuk kirim data: <code>POST /api/trash/entries</code>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
