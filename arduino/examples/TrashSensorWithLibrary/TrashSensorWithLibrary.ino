// Example penggunaan IRSensor Library

#include "IRSensor.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Konfigurasi
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* serverName = "http://192.168.1.100:5000/api/trash/entries";
const char* sensorId = "IR_SENSOR_01";

// Create IR Sensor instance
IRSensor irSensor(35, 2000, 200);  // Pin 35, Threshold 2000, Debounce 200ms

// Variables
int trashCount = 0;
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 5000;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n=== IR Trash Detector v2 (dengan Library) ===");
  
  // Calibrate sensor (optional)
  // irSensor.calibrate();
  
  Serial.println("Connecting to WiFi...");
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
  // Baca dan cek sensor
  static unsigned long lastPrintTime = 0;
  if (millis() - lastPrintTime >= 1000) {
    Serial.print("Sensor Value: ");
    Serial.println(irSensor.readValue());
    lastPrintTime = millis();
  }
  
  // Cek deteksi
  if (irSensor.isDetected()) {
    trashCount++;
    Serial.print("🗑️  Sampah Terdeteksi! Total: ");
    Serial.println(trashCount);
  }
  
  // Kirim data ke API
  if (millis() - lastSendTime >= SEND_INTERVAL && WiFi.status() == WL_CONNECTED) {
    if (trashCount > 0) {
      sendToServer(trashCount);
      trashCount = 0;
    }
    lastSendTime = millis();
  }
  
  // Reconnect WiFi jika disconnect
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi Disconnected. Reconnecting...");
    WiFi.reconnect();
  }
  
  delay(10);
}

void sendToServer(int count) {
  HTTPClient http;
  
  StaticJsonDocument<200> doc;
  doc["sensor_id"] = sensorId;
  doc["notes"] = "Automated trash detection";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.print("📤 Sending ");
  Serial.print(count);
  Serial.println(" entries...");
  
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");
  
  for (int i = 0; i < count; i++) {
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.print("✅ Entry ");
      Serial.print(i + 1);
      Serial.println(" sent");
    } else {
      Serial.print("❌ Entry ");
      Serial.print(i + 1);
      Serial.print(" failed: ");
      Serial.println(httpResponseCode);
    }
    
    delay(100);
  }
  
  http.end();
}
