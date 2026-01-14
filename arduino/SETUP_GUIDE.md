# 🔧 Setup Guide - Arduino/ESP32 IR Sensor

## Quick Start Checklist

- [ ] Install Arduino IDE
- [ ] Install ESP32 Board Support
- [ ] Install ArduinoJson Library
- [ ] Setup Hardware (Wiring)
- [ ] Configure WiFi & API IP
- [ ] Test Sensor Value
- [ ] Test WiFi Connection
- [ ] Test API Communication
- [ ] Deploy Main Code

## Step-by-Step Installation

### 1️⃣ Install Arduino IDE
1. Download from https://www.arduino.cc/en/software
2. Install sesuai OS Anda
3. Jalankan Arduino IDE

### 2️⃣ Add ESP32 Board Support

1. Buka **File → Preferences**
2. Copy-paste URL di "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Klik OK
4. Buka **Tools → Board → Boards Manager**
5. Search "esp32"
6. Click Install pada "esp32 by Espressif Systems"
7. Tunggu sampai selesai
8. Close Boards Manager

### 3️⃣ Install Libraries

1. **Buka Tools → Manage Libraries** (atau Ctrl+Shift+I)
2. Search: `ArduinoJson`
   - Install **ArduinoJson** v6.x by Benoit Blanchon
3. Libraries lain sudah built-in di ESP32:
   - WiFi.h
   - HTTPClient.h

### 4️⃣ Setup Board Settings

1. **Tools → Board** → Select **ESP32 → ESP32 Dev Module**
2. **Tools → Port** → Select COM port ESP32 Anda
3. **Tools → Upload Speed** → **921600**
4. **Tools → CPU Frequency** → **240MHz**

Verifikasi:
```
Board: ESP32 Dev Module
Port: COM3 (atau COM port yang terdeteksi)
Upload Speed: 921600
CPU Frequency: 240MHz(WiFi/BT)
```

## Hardware Wiring

### Komponen yang Dibutuhkan:
- 1x ESP32 Dev Board
- 1x IR Sensor (Sharp GP2Y0A21YK0F recommended)
- 1x Kapasitor 100µF
- Jumper wires
- Power supply 5V

### Pin Connections:

```
┌─────────────────────────────────────┐
│          ESP32 Dev Board            │
│                                      │
│  3V3 ─────┬───────────────┬─ GND    │
│           │               │          │
│           🔴             ⚫          │  IR Sensor
│                                      │
│  GPIO 35  ← Yellow (OUT)             │
│                                      │
└─────────────────────────────────────┘

IR Sensor Pinout:
- Red (VCC)   → 3V3
- Black (GND) → GND  
- Yellow (OUT)→ GPIO 35 (ADC)

Optional Capacitor:
- Positive (+) → 3V3
- Negative (-) → GND
(Untuk filtering power supply noise)
```

## Testing Sequence

### Test 1: Sensor Value
Upload `test_sketches/SensorTest.ino`
```
Expected output:
Sensor Value: 1200 - No object
Sensor Value: 2800 ✓ OBJECT DETECTED

Arahkan tangan ke sensor, value seharusnya naik drastis
```

### Test 2: WiFi Connection
Edit `test_sketches/WiFiTest.ino`:
```cpp
const char* ssid = "YOUR_SSID";        // ← Ganti dengan WiFi Anda
const char* password = "YOUR_PASSWORD"; // ← Ganti password WiFi
```

Upload dan buka Serial Monitor (115200 baud):
```
Expected output:
Connecting to MyNetwork...
✅ WiFi Connected!
IP Address: 192.168.1.100
RSSI: -45
```

### Test 3: API Communication
Edit `test_sketches/APITest.ino`:
```cpp
const char* serverName = "http://192.168.1.100:5000/api/trash/entries";
// ↑ Ganti IP sesuai IP backend Anda
```

Pastikan backend running:
```bash
cd backend
npm run dev
```

Upload dan buka Serial Monitor:
```
Expected output:
✅ WiFi Connected!
Connecting to: http://192.168.1.100:5000/api/trash/entries
Status Code: 201
✅ API Request Successful!
```

## Configuration untuk Main Code

Edit `TrashSensorMain/TrashSensorMain.ino` baris 9-13:

```cpp
const char* ssid = "MyNetwork";          // ← WiFi SSID
const char* password = "MyPassword123";  // ← WiFi Password
const char* serverName = "http://192.168.1.100:5000/api/trash/entries";
// ↑ Ganti IP backend Anda
const char* sensorId = "IR_SENSOR_01";   // ← ID unique sensor
```

Dan sesuaikan pin & threshold (baris 1-4):
```cpp
#define SENSOR_PIN 35          // Pin sensor (ADC: 32,33,34,35,36,39)
#define DEBOUNCE_TIME 200      // Debounce dalam ms
#define THRESHOLD 2000         // Threshold untuk deteksi
```

## Upload & Run

1. Hubungkan ESP32 ke USB
2. Buka main code: `TrashSensorMain.ino`
3. Verify code (Sketch → Verify)
4. Upload (Sketch → Upload)
5. Tunggu upload complete
6. Buka Serial Monitor (Tools → Serial Monitor)
7. Baud Rate: **115200**
8. Arahkan objek ke sensor
9. Lihat output di Serial Monitor

Expected output:
```
=== IR Sensor Trash Detector Initialized ===
Connecting to WiFi...
✅ WiFi Connected!
IP: 192.168.1.100
System Ready!
Sensor Value: 1200
Sensor Value: 1250
🗑️  Sampah Terdeteksi! Total: 1
📤 Sending 1 entries...
✅ Entry 1 sent
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Board tidak terdeteksi | Cek driver USB ESP32, restart IDE |
| WiFi connect failed | Check SSID/password, pastikan 2.4GHz |
| Sensor tidak deteksi | Check wiring, adjust THRESHOLD |
| API error | Cek backend running, verify IP address |
| Upload error | Change USB port, update drivers |

## Next Steps

✅ Setelah semua test sukses:
1. Deploy main code ke ESP32
2. Biarkan berjalan (auto-reconnect jika WiFi drop)
3. Monitor via Serial Monitor atau check database
4. Integrate dengan Frontend Next.js

---

**Tips:**
- Keep Serial Monitor open untuk monitoring
- Test setiap component terpisah dulu
- Calibrate threshold untuk akurasi terbaik
- Use unique sensor_id untuk multiple sensors
