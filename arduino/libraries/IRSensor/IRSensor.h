// Library untuk IR Sensor
// File ini bisa digunakan sebagai module untuk sensor IR

#ifndef IR_SENSOR_H
#define IR_SENSOR_H

#include <Arduino.h>

class IRSensor {
private:
  int sensorPin;
  int threshold;
  unsigned long lastDetectionTime;
  unsigned long debounceTime;
  bool lastState;

public:
  IRSensor(int pin, int thresh = 2000, unsigned long debounce = 200) {
    sensorPin = pin;
    threshold = thresh;
    debounceTime = debounce;
    lastDetectionTime = 0;
    lastState = false;
    pinMode(sensorPin, INPUT);
  }

  // Baca nilai sensor
  int readValue() {
    return analogRead(sensorPin);
  }

  // Check apakah ada deteksi dengan debounce
  bool isDetected() {
    int value = readValue();
    bool currentState = (value > threshold);
    
    // Jika state berubah dan debounce time terpenuhi
    if (currentState && !lastState && (millis() - lastDetectionTime > debounceTime)) {
      lastDetectionTime = millis();
      lastState = currentState;
      return true;
    }
    
    if (!currentState) {
      lastState = false;
    }
    
    return false;
  }

  // Set threshold baru
  void setThreshold(int thresh) {
    threshold = thresh;
  }

  // Get threshold
  int getThreshold() {
    return threshold;
  }

  // Calibrate threshold (ambil rata-rata nilai)
  int calibrate(int samples = 100) {
    long sum = 0;
    Serial.println("Calibrating IR Sensor...");
    
    for (int i = 0; i < samples; i++) {
      sum += analogRead(sensorPin);
      delay(10);
    }
    
    int average = sum / samples;
    threshold = average + 500;  // Set threshold 500 point above background
    
    Serial.print("Calibration Complete. Average: ");
    Serial.print(average);
    Serial.print(", New Threshold: ");
    Serial.println(threshold);
    
    return threshold;
  }
};

#endif
