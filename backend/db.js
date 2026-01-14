// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Tentukan lokasi file database (nanti muncul file trash_data.db di folder backend)
const dbPath = path.resolve(__dirname, 'trash_data.db');

// Buka koneksi ke database (kalau file gak ada, otomatis dibuat)
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb(); // Panggil fungsi buat bikin tabel
    }
});

// Fungsi buat bikin tabel & isi data dummy
function initDb() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS trash_detections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_id TEXT NOT NULL,
        detection_value INTEGER DEFAULT 1,
        detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `;

    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err);
            return;
        }
        console.log('Table "trash_detections" ready.');
        
        // Cek apakah tabel kosong, kalau iya isi data dummy
        db.get("SELECT count(*) as count FROM trash_detections", (err, row) => {
            if (row.count === 0) {
                console.log("Database kosong, mengisi data dummy buat demo...");
                const insertQuery = `INSERT INTO trash_detections (sensor_id, detected_at) VALUES (?, datetime('now', ?))`;
                
                // Data dummy 
                db.run(insertQuery, ['BIN-01', '-1 hour']);
                db.run(insertQuery, ['BIN-01', '-2 hours']);
                db.run(insertQuery, ['BIN-01', '-3 hours']);
                db.run(insertQuery, ['BIN-01', '-5 hours']);
                db.run(insertQuery, ['BIN-01', '-1 day']);
                console.log("Data dummy berhasil dimasukkan!");
            }
        });
    });
}

module.exports = db;