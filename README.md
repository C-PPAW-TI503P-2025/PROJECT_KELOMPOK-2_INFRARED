# 🚀 QUICK START GUIDE

## Langkah Menjalankan Project

### 1️⃣ Buka Terminal
```bash
cd backend
```

### 2️⃣ Install Dependencies (Jika Belum)
```bash
npm install
```

### 3️⃣ Jalankan Server
```bash
npm run dev
```

### 4️⃣ Buka Browser
Akses: **http://localhost:5000**

---

## 🛑 Stop Server
Tekan `Ctrl + C` di terminal

---

## 📚 Dokumentasi Lengkap
Lihat [frontend/README.md](frontend/README.md) untuk dokumentasi lengkap.

## 🎯 Fitur
- ✅ Dashboard monitoring real-time
- ✅ Grafik 7 hari terakhir
- ✅ Tabel riwayat dengan pagination
- ✅ Filter sensor ID
- ✅ Auto-refresh setiap 30 detik

## 🗄️ Database
Menggunakan SQLite (file: `backend/trash_monitoring.db`)
- Auto-created saat server pertama running
- Tidak perlu setup MySQL

## 🧪 Test API
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/trash/entries" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"sensor_id":"BIN-01","notes":"Test"}'
```