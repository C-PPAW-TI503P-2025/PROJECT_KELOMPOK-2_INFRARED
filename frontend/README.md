# 🚀 Cara Menjalankan IR Trash Monitoring System

## 📋 Prerequisites
- **Node.js** sudah terinstall (cek dengan `node --version`)
- **npm** sudah terinstall (cek dengan `npm --version`)

---

## 🔧 Langkah-langkah Menjalankan Project

### **1. Buka Terminal/PowerShell**
Buka terminal di folder project:
```
PROJECT_KELOMPOK-2_INFRARED
```

### **2. Masuk ke Folder Backend**
```bash
cd backend
```

### **3. Install Dependencies (Jika Belum)**
```bash
npm install
```

### **4. Jalankan Server Backend**
```bash
npm run dev
```

Tunggu sampai muncul pesan:
```
🚀 Server is running on http://localhost:5000
📊 Dashboard available at http://localhost:5000
📚 API Documentation available at http://localhost:5000/api
```

### **5. Buka Browser**
Buka browser (Chrome, Firefox, Edge, dll) dan akses:
```
http://localhost:5000
```

**Dashboard akan langsung muncul!** ✅

---

## 🎯 Fitur Dashboard

✅ **Statistik Real-time**
- Total deteksi hari ini
- Total deteksi keseluruhan
- Jumlah entry hari ini & total

✅ **Grafik 7 Hari Terakhir**
- Bar chart dengan Chart.js
- Visualisasi trend deteksi

✅ **Tabel Riwayat Deteksi**
- Pagination (10 entries/halaman)
- Filter berdasarkan Sensor ID
- Auto-refresh setiap 30 detik

---

## 🧪 Testing - Menambah Data Baru

### Via PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/trash/entries" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"sensor_id":"BIN-01","notes":"Test data"}'
```

### Via Arduino/ESP32:
```cpp
// Contoh HTTP POST request
HTTPClient http;
http.begin("http://localhost:5000/api/trash/entries");
http.addHeader("Content-Type", "application/json");
String payload = "{\"sensor_id\":\"BIN-01\"}";
http.POST(payload);
```

---

## 📂 Struktur Project

```
PROJECT_KELOMPOK-2_INFRARED/
├── backend/
│   ├── config/
│   │   └── database.js          ← Konfigurasi database (SQLite)
│   ├── controllers/
│   │   └── trashController.js   ← Logic API
│   ├── models/
│   │   ├── index.js
│   │   └── TrashEntry.js        ← Model data
│   ├── routes/
│   │   └── trashRoutes.js       ← API routes
│   ├── .env                     ← Environment variables
│   ├── server.js                ← Main server file
│   ├── package.json
│   └── trash_monitoring.db      ← SQLite database (auto-created)
├── frontend/
│   ├── index.html               ← Dashboard HTML
│   ├── style.css                ← Styling
│   ├── app.js                   ← JavaScript logic
│   └── README.md                ← Dokumentasi ini
└── arduino/
```

---

## 🛠️ Troubleshooting

### ❌ Error: "Cannot find module"
**Solusi:** Install dependencies
```bash
cd backend
npm install
```

### ❌ Error: "Port 5000 already in use"
**Solusi:** Ubah port di file `.env`
```
PORT=3000
```

### ❌ Dashboard tidak muncul data
**Solusi:** 
1. Pastikan backend running
2. Refresh browser (F5)
3. Check console browser (F12) untuk error

### ❌ CORS Error
**Solusi:** Backend sudah include CORS middleware, pastikan backend running di port yang sama dengan yang diakses

---

## 📊 Database

Project ini menggunakan **SQLite** untuk development:
- File database: `backend/trash_monitoring.db`
- Auto-created saat server pertama kali running
- Tidak perlu setup MySQL/PostgreSQL

### Jika Ingin Pakai MySQL:
Edit file `backend/config/database.js`:
1. Comment code SQLite
2. Uncomment code MySQL
3. Setup MySQL dan update `.env`

---

## 🔄 Stop Server

Untuk stop server, tekan:
```
Ctrl + C
```
di terminal yang running server

---

## 📝 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/trash/entries` | Tambah data deteksi baru |
| GET | `/api/trash/entries` | Get semua entries (pagination) |
| GET | `/api/trash/dashboard` | Get dashboard summary |
| GET | `/api/trash/daily` | Get data per hari |
| GET | `/api/trash/statistics` | Get statistik range tanggal |
| DELETE | `/api/trash/entries/:id` | Hapus entry by ID |

---

## 🎨 Tech Stack

**Backend:**
- Node.js + Express.js
- Sequelize ORM
- SQLite Database
- CORS enabled

**Frontend:**
- Vanilla HTML/CSS/JavaScript
- Chart.js untuk grafik
- Responsive design
- Auto-refresh

---

## ✨ Next Steps (Opsional)

- [ ] Tambah fitur export data (CSV/PDF)
- [ ] Implementasi WebSocket untuk real-time updates
- [ ] Dark/Light mode toggle
- [ ] Notifikasi push saat ada deteksi baru
- [ ] Mobile app dengan React Native

---

**Project siap digunakan!** 🎉

Untuk pertanyaan atau issue, silakan hubungi tim development.
