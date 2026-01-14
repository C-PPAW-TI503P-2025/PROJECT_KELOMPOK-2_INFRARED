// Test Sketch - Sensor Value Reading
// Untuk mengecek sensor value tanpa WiFi

#define SENSOR_PIN 35

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("=== IR Sensor Test ===");
  Serial.println("Reading sensor values every 100ms");
  Serial.println("Place object in front of sensor to see changes");
  Serial.println();
}

void loop() {
  int value = analogRead(SENSOR_PIN);
  
  Serial.print("Sensor Value: ");
  Serial.print(value);
  
  // Status indicator
  if (value > 2000) {
    Serial.println(" ✓ OBJECT DETECTED");
  } else if (value > 1500) {
    Serial.println(" ~ Medium distance");
  } else {
    Serial.println(" - No object");
  }
  
  delay(100);
}
