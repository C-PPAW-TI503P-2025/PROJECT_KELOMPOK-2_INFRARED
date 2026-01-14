# Arduino/ESP32 Code - IR Trash Sensor

Kode Arduino untuk ESP32 yang menghubungkan sensor IR untuk mendeteksi dan menghitung sampah yang masuk, kemudian mengirim data ke backend API.

## 📋 Hardware yang Dibutuhkan

1. **ESP32 Development Board**
   - Dual-core 240MHz processor
   - WiFi & Bluetooth
   - ADC (Analog to Digital Converter)

2. **Sensor IR**
   - Sharp GP2Y0A21YK0F (Recommended)
   - atau CNY70 Infrared Sensor
   - atau QTR-8 Reflectance Sensor

3. **Supporting Components**
   - Kapasitor 100µF (Power supply filtering)
   - Resistor 10kΩ (Pull-up/Pull-down)
   - Jumper wires

## 🔌 Wiring Diagram

```
IR Sensor Module:
  VCC (Red)   → 3V3 (ESP32 Pin 3V3)
  GND (Black) → GND (ESP32 Pin GND)
  OUT (Yellow)→ GPIO 35 (ESP32 Analog Input)

Optional LED Indicator:
  Anode → GPIO 4 (melalui resistor 220Ω)
  Cathode → GND
```

## 🚀 Setup & Installation

### 1. Install Arduino IDE
- Download dari https://www.arduino.cc/en/software

### 2. Install ESP32 Board Support
- Buka Arduino IDE
- File → Preferences
- Paste URL di "Additional Board Manager URLs":
  ```
  https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
  ```
- Tools → Board → Boards Manager
- Cari "esp32" dan install oleh Espressif Systems

### 3. Install Required Libraries
- Sketch → Include Library → Manage Libraries
- Cari dan install:
  - **ArduinoJson** (v6.x) by Benoit Blanchon
  - **WiFi** (built-in dengan ESP32)
  - **HTTPClient** (built-in dengan ESP32)

### 4. Konfigurasi Board
- Tools → Board → ESP32 → ESP32 Dev Module
- Tools → Port → Pilih COM port ESP32 Anda
- Tools → Upload Speed → 921600
- Tools → CPU Frequency → 240MHz

## 📝 Konfigurasi Kode

Buka file `TrashSensorMain.ino` dan sesuaikan:

```cpp
// WiFi Configuration
const char* ssid = "YOUR_SSID";              // Nama WiFi Anda
const char* password = "YOUR_PASSWORD";      // Password WiFi

// API Configuration
const char* serverName = "http://YOUR_IP:5000/api/trash/entries";
const char* sensorId = "IR_SENSOR_01";       // ID unik sensor

// Sensor Configuration
#define SENSOR_PIN 35          // GPIO untuk sensor (ADC pin)
#define THRESHOLD 2000         // Nilai threshold deteksi
#define DEBOUNCE_TIME 200      // Debounce time dalam ms
#define SEND_INTERVAL 5000     // Interval kirim data dalam ms
```

## 🧪 Testing & Calibration

### 1. Cek Sensor Value
- Upload code ke ESP32
- Buka Serial Monitor (Tools → Serial Monitor)
- Baud Rate: 115200
- Lihat nilai "Sensor Value" yang ditampilkan setiap detik

### 2. Calibrate Threshold
Uncomment baris ini di `setup()`:
```cpp
irSensor.calibrate();  // Untuk menggunakan library version
```
Atau gunakan manual:
```
- Tanpa objek: ~1000-1500
- Dengan objek: ~2500-4000
- Set THRESHOLD di tengah range terjauh
```

### 3. Test Deteksi
- Arahkan objek ke sensor
- Seharusnya muncul pesan "🗑️ Sampah Terdeteksi!"

### 4. Test API Connection
- Pastikan backend running di `http://YOUR_IP:5000`
- Lihat di Serial Monitor pesan pengiriman data
- Check database untuk verifikasi data masuk

## 📂 File Structure

```
arduino/
├── TrashSensorMain/
│   └── TrashSensorMain.ino          # Main code (simple version)
├── libraries/
│   └── IRSensor/
│       └── IRSensor.h               # Library untuk IR Sensor
├── examples/
│   └── TrashSensorWithLibrary/
│       └── TrashSensorWithLibrary.ino  # Example dengan library
├── test_sketches/
│   ├── SensorTest.ino                # Test sensor value
│   ├── WiFiTest.ino                  # Test WiFi connection
│   └── APITest.ino                   # Test API communication
└── README.md                         # Dokumentasi ini
```

## 🛠️ Troubleshooting

### WiFi Connection Failed
```
❌ Solusi:
1. Cek SSID dan password (case sensitive)
2. ESP32 harus pada 2.4GHz WiFi (tidak support 5GHz)
3. Check distance dan signal strength
4. Restart router
```

### Sensor tidak mendeteksi
```
❌ Solusi:
1. Cek wiring (terutama pin OUT)
2. Print sensor value di Serial Monitor
3. Adjust THRESHOLD sesuai kondisi
4. Pastikan sensor mendapat power stabil (gunakan kapasitor)
```

### API tidak terkoneksi
```
❌ Solusi:
1. Check backend API running (http://YOUR_IP:5000)
2. Ping dari komputer ke backend
3. Check firewall
4. Verify IP address di kode
5. Check WiFi connection status
```

### Data tidak terkirim
```
❌ Solusi:
1. Check Serial Monitor output
2. Verify sensor deteksi bekerja
3. Check SEND_INTERVAL (tunggu sampai waktu)
4. Verify backend database synchronization
```

## 📊 Serial Monitor Output Example

```
=== IR Sensor Trash Detector Initialized ===
Connecting to WiFi...
.....
✅ WiFi Connected!
IP: 192.168.1.100
System Ready!
Sensor Value: 1200
Sensor Value: 1250
🗑️  Sampah Terdeteksi! Total: 1
Sensor Value: 1300
Sensor Value: 2800
🗑️  Sampah Terdeteksi! Total: 2
📤 Sending 2 entries...
✅ Entry 1 sent
✅ Entry 2 sent
```

## 🔄 Data Flow

```
[Sensor IR]
    ↓
[ESP32 GPIO 35 (ADC)]
    ↓
[Deteksi sampah dengan threshold]
    ↓
[Accumulate count]
    ↓
[Every 5 seconds] → [POST to Backend API]
                       ↓
                   [Save to Database]
                       ↓
                   [Frontend Display]
```

## 📡 API Integration

Data dikirim ke: `POST /api/trash/entries`

```json
{
  "sensor_id": "IR_SENSOR_01",
  "notes": "Trash detected by IR sensor"
}
```

Backend akan otomatis:
- Record timestamp
- Set tanggal hari ini
- Increment count
- Save ke database

## 🔧 Advanced Configuration

### Multiple Sensors
Untuk menambah multiple sensors, edit kode:
```cpp
// Multiple sensors
IRSensor sensor1(35, 2000);  // Pin 35
IRSensor sensor2(34, 2000);  // Pin 34
IRSensor sensor3(39, 2000);  // Pin 39

// Di loop
if (sensor1.isDetected()) { sendToServer(1, "IR_SENSOR_01"); }
if (sensor2.isDetected()) { sendToServer(1, "IR_SENSOR_02"); }
if (sensor3.isDetected()) { sendToServer(1, "IR_SENSOR_03"); }
```

### Deep Sleep Mode
Untuk menghemat power (battery-powered):
```cpp
// Sleep selama 10 detik
esp_sleep_enable_timer_wakeup(10 * 1000000);  // 10 seconds
esp_light_sleep_start();
```

### EEPROM Storage
Simpan count data lokal sebelum send:
```cpp
#include <EEPROM.h>
// Simpan ke EEPROM jika WiFi disconnect
// Kirim ketika WiFi reconnect
```

## 📚 Resources

- ESP32 Pinout: https://github.com/espressif/esp-idf
- Arduino IDE Docs: https://www.arduino.cc/en/Reference
- ArduinoJson: https://arduinojson.org/
- Sharp IR Sensor Datasheet: https://www.sparkfun.com/datasheets/Sensors/Infrared/gp2y0a21yk_e.pdf

## 💡 Tips & Best Practices

1. **Debouncing**: Selalu gunakan debounce untuk sensor digital
2. **Threshold Calibration**: Calibrate untuk kondisi lingkungan terbaik
3. **Error Handling**: Check WiFi status sebelum POST
4. **Power Supply**: Gunakan clean power supply untuk akurasi sensor
5. **Logging**: Enable Serial logging untuk debugging
6. **Testing**: Test setiap component secara terpisah dulu
7. **Documentation**: Comment kode untuk maintainability

## 📞 Support

Untuk bantuan:
1. Check Serial Monitor output
2. Read kode comments
3. Check backend API logs
4. Verify hardware connections

---

**Last Updated**: January 14, 2026
