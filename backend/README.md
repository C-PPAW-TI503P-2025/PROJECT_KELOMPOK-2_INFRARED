# IR Trash Monitoring System - Backend

Backend API untuk sistem monitoring sensor IR penghitung sampah menggunakan Express.js, Sequelize, dan MySQL.

## 🚀 Fitur

- ✅ Record data sampah yang terdeteksi sensor IR
- ✅ Hitung total sampah per hari
- ✅ Statistik sampah per range tanggal
- ✅ Dashboard summary (hari ini, total, 7 hari terakhir)
- ✅ Pagination untuk data entries
- ✅ Support multiple sensor ID

## 📋 Prerequisites

- Node.js (v14 atau lebih tinggi)
- MySQL (v5.7 atau lebih tinggi)
- npm atau yarn

## 🔧 Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Setup database:
- Buat database MySQL dengan nama `infrared_monitoring`
```sql
CREATE DATABASE infrared_monitoring;
```

3. Konfigurasi environment variables:
- Copy file `.env.example` ke `.env`
- Sesuaikan konfigurasi database di file `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=infrared_monitoring
DB_PORT=3306
PORT=5000
```

4. Jalankan server:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## 📡 API Endpoints

### 1. Add Trash Entry
**POST** `/api/trash/entries`

Record data sampah baru ketika sensor mendeteksi.

Request Body:
```json
{
  "sensor_id": "IR_SENSOR_01",
  "notes": "Optional notes"
}
```

Response:
```json
{
  "success": true,
  "message": "Trash entry recorded successfully",
  "data": {
    "id": 1,
    "sensor_id": "IR_SENSOR_01",
    "count": 1,
    "timestamp": "2026-01-14T10:30:00.000Z",
    "date": "2026-01-14"
  }
}
```

### 2. Get Daily Count
**GET** `/api/trash/daily?date=2026-01-14&sensor_id=IR_SENSOR_01`

Ambil total sampah per hari tertentu.

Query Parameters:
- `date` (optional): Format YYYY-MM-DD, default = hari ini
- `sensor_id` (optional): Filter by sensor ID

Response:
```json
{
  "success": true,
  "date": "2026-01-14",
  "total_count": 25,
  "entries_count": 25,
  "data": [...]
}
```

### 3. Get Statistics
**GET** `/api/trash/statistics?start_date=2026-01-01&end_date=2026-01-14`

Ambil statistik per hari untuk range tanggal tertentu.

Query Parameters:
- `start_date` (optional): Tanggal mulai
- `end_date` (optional): Tanggal akhir
- `sensor_id` (optional): Filter by sensor ID

Response:
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-01-14",
      "total_entries": 25,
      "total_trash": 25
    }
  ]
}
```

### 4. Get All Entries
**GET** `/api/trash/entries?page=1&limit=50`

Ambil semua entries dengan pagination.

Query Parameters:
- `page` (optional): Default = 1
- `limit` (optional): Default = 50
- `sensor_id` (optional): Filter by sensor ID

Response:
```json
{
  "success": true,
  "total": 100,
  "page": 1,
  "limit": 50,
  "total_pages": 2,
  "data": [...]
}
```

### 5. Get Dashboard Summary
**GET** `/api/trash/dashboard`

Ambil summary untuk dashboard (hari ini, total, 7 hari terakhir).

Response:
```json
{
  "success": true,
  "data": {
    "today": {
      "date": "2026-01-14",
      "count": 25,
      "entries": 25
    },
    "total": {
      "count": 1500,
      "entries": 1500
    },
    "weekly": [
      {
        "date": "2026-01-08",
        "total": 30
      }
    ]
  }
}
```

### 6. Delete Entry
**DELETE** `/api/trash/entries/:id`

Hapus entry berdasarkan ID.

Response:
```json
{
  "success": true,
  "message": "Entry deleted successfully"
}
```

## 📊 Database Schema

### Table: trash_entries

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key, auto increment |
| sensor_id | VARCHAR(50) | ID sensor yang mendeteksi |
| count | INT | Jumlah sampah (default: 1) |
| timestamp | DATETIME | Waktu deteksi |
| date | DATE | Tanggal untuk grouping |
| sensor_status | ENUM | Status sensor (active/inactive/error) |
| notes | TEXT | Catatan tambahan |
| created_at | DATETIME | Waktu record dibuat |
| updated_at | DATETIME | Waktu record diupdate |

## 🧪 Testing dengan cURL

Tambah entry baru:
```bash
curl -X POST http://localhost:5000/api/trash/entries \
  -H "Content-Type: application/json" \
  -d '{"sensor_id": "IR_SENSOR_01"}'
```

Get daily count:
```bash
curl http://localhost:5000/api/trash/daily?date=2026-01-14
```

Get dashboard:
```bash
curl http://localhost:5000/api/trash/dashboard
```

## 📝 Notes

- Database akan otomatis ter-sync saat server pertama kali dijalankan
- Semua timestamp menggunakan ISO 8601 format
- CORS sudah diaktifkan untuk development
- Gunakan nodemon untuk auto-restart saat development

## 🔜 Next Steps

Selanjutnya bisa dibuat:
- Frontend dengan Next.js
- Real-time updates dengan WebSocket/Socket.io
- Authentication & Authorization
- Data export (CSV/Excel)
- Grafik visualisasi data
