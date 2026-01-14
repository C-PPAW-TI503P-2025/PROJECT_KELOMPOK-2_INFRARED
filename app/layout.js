export const metadata = {
  title: "Trash Monitoring (IR Sensor)",
  description: "Dashboard monitoring tempat sampah berbasis sensor IR",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <div className="container">
          <header className="nav">
            <a href="/" className="active">Dashboard</a>
            <a href="/entries">Entries</a>
            <a href="/history">Per Hari</a>
          </header>
          {children}
          <footer style={{marginTop:24}} className="small">
            DB: SQLite (data/trash_monitoring.db). API: /api/trash/*
          </footer>
        </div>
      </body>
    </html>
  );
}
