#define SENSOR_PIN 35  // Pin analog untuk sensor IR (GPIO 35 - ADC)
#define DEBOUNCE_TIME 200  // Debounce 200ms
#define THRESHOLD 2000  // Threshold untuk deteksi sampah

// Variables
unsigned long lastDetectionTime = 0;
int trashCount = 0;
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 5000;  // Kirim data setiap 5 detik

// WiFi & API Configuration
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* serverName = "http://192.168.1.100:5000/api/trash/entries";
const char* sensorId = "IR_SENSOR_01";

// Libraries yang dibutuhkan:
// - WiFi.h (built-in di ESP32)
// - HTTPClient.h (built-in di ESP32)
// - ArduinoJson.h (tambah dari library manager)

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n=== IR Sensor Trash Detector Initialized ===");
  Serial.println("Connecting to WiFi...");
  
  // Inisialisasi pin sensor
  pinMode(SENSOR_PIN, INPUT);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
  }
  
  Serial.println("System Ready!");
}

void loop() {
  // Baca sensor
  int sensorValue = analogRead(SENSOR_PIN);
  
  // Debug: print sensor value setiap 1 detik
  static unsigned long lastPrintTime = 0;
  if (millis() - lastPrintTime >= 1000) {
    Serial.print("Sensor Value: ");
    Serial.println(sensorValue);
    lastPrintTime = millis();
  }
  
  // Deteksi sampah (ketika sensor IR menangkap objek)
  if (sensorValue > THRESHOLD) {
    // Cek debounce time
    if (millis() - lastDetectionTime > DEBOUNCE_TIME) {
      trashCount++;
      lastDetectionTime = millis();
      
      Serial.print("🗑️  Sampah Terdeteksi! Total: ");
      Serial.println(trashCount);
      
      // Optional: buzz or LED indicator
      // digitalWrite(LED_PIN, HIGH);
      // delay(100);
      // digitalWrite(LED_PIN, LOW);
    }
  }
  
  // Kirim data ke API setiap SEND_INTERVAL
  if (millis() - lastSendTime >= SEND_INTERVAL && WiFi.status() == WL_CONNECTED) {
    if (trashCount > 0) {
      sendToServer(trashCount);
      trashCount = 0;  // Reset counter
    }
    lastSendTime = millis();
  }
  
  // Reconnect WiFi jika terputus
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi Disconnected. Reconnecting...");
    WiFi.reconnect();
  }
  
  delay(10);  // Small delay untuk stability
}

void sendToServer(int count) {
  HTTPClient http;
  
  // Buat JSON payload
  StaticJsonDocument<200> doc;
  doc["sensor_id"] = sensorId;
  doc["notes"] = "Trash detected by IR sensor";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.print("Sending ");
  Serial.print(count);
  Serial.println(" trash entries to server...");
  
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");
  
  // Kirim data sebanyak 'count' kali
  for (int i = 0; i < count; i++) {
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("✅ Entry ");
      Serial.print(i + 1);
      Serial.print(" sent. Response: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("❌ Error sending entry ");
      Serial.print(i + 1);
      Serial.print(": ");
      Serial.println(httpResponseCode);
    }
    
    delay(100);  // Delay antara request
  }
  
  http.end();
}

/*
=== CATATAN KONFIGURASI ===

1. SENSOR PIN:
   - Gunakan pin analog: 32, 33, 34, 35, 36, 39 (ADC1)
   - Jangan gunakan pin 36, 39 jika WiFi aktif (terganggu noise)
   - Rekomendasi: GPIO 35

2. THRESHOLD:
   - Nilai sensor IR tanpa objek: ~1000-1500
   - Nilai sensor IR dengan objek: ~2500-4000
   - Adjust THRESHOLD sesuai kondisi ruangan
   - Test dengan Serial Monitor dulu

3. WIRING (ESP32 to IR Sensor):
   
   IR Sensor Module:
   - VCC → 3V3 (ESP32)
   - GND → GND (ESP32)
   - OUT → GPIO 35 (Analog)
   
   (Untuk sensor analog seperti SHARP atau CNY70)

4. DEPENDENCIES:
   - ArduinoJson 6.x (Install via Arduino IDE)
   
   Cara install di Arduino IDE:
   - Sketch → Include Library → Manage Libraries
   - Cari "ArduinoJson"
   - Install by Benoit Blanchon

5. TROUBLESHOOTING:
   - Tidak ada deteksi? Check sensor wiring
   - WiFi tidak connect? Check SSID & password
   - Sensor value tidak stable? Tambah kapasitor 100µF
   - ADC noise? Gunakan different pin atau add smoothing

6. OPTIMIZATION TIPS:
   - Increase SEND_INTERVAL untuk reduce server load
   - Adjust DEBOUNCE_TIME jika ada false detection
   - Use deep sleep mode jika device berjalan dari battery
*/
