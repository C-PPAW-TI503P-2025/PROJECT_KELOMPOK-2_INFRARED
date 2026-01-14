// Test Sketch - API Communication
// Untuk mengecek koneksi dan komunikasi dengan backend API

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* serverName = "http://192.168.1.100:5000/api/trash/entries";  // Change IP

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n=== API Communication Test ===");
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi Connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    
    delay(1000);
    testAPI();
  } else {
    Serial.println("❌ WiFi Connection Failed!");
  }
}

void loop() {
  delay(10000);  // Wait 10 seconds
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nSending test request...");
    testAPI();
  } else {
    Serial.println("❌ WiFi Disconnected!");
  }
}

void testAPI() {
  HTTPClient http;
  
  Serial.print("Connecting to: ");
  Serial.println(serverName);
  
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");
  
  // Create test payload
  StaticJsonDocument<200> doc;
  doc["sensor_id"] = "IR_TEST_SENSOR";
  doc["notes"] = "API Test Request";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("Payload:");
  Serial.println(jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  Serial.println("\nResponse:");
  if (httpResponseCode > 0) {
    Serial.print("Status Code: ");
    Serial.println(httpResponseCode);
    
    String response = http.getString();
    Serial.print("Response: ");
    Serial.println(response);
    
    if (httpResponseCode == 201) {
      Serial.println("✅ API Request Successful!");
    } else {
      Serial.print("⚠️  Unexpected status code: ");
      Serial.println(httpResponseCode);
    }
  } else {
    Serial.print("❌ HTTP Error: ");
    Serial.println(httpResponseCode);
    Serial.print("Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }
  
  http.end();
}
