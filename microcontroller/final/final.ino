  #include <WiFi.h>
  #include <PubSubClient.h>
  #include <SPI.h>
  #include <MFRC522.h>
  #include <ArduinoJson.h>
  #include <ESP32Servo.h>
  #include "secrets.h"

  // Pin Definitions
  const int buzzerPin = 14;
  const int statusRed = 4;    // BUSY / CONNECTING
  const int statusGreen = 5;  // READY / CONNECTED
  const int ledFeedbackRed = 27; 
  const int ledFeedbackGreen = 12;

  #define SERVO_PIN 13      
  #define SS_PIN 21        
  #define RST_PIN 22       

  // Constants from secrets.h
  const char* ssid = SECRET_SSID;
  const char* password = SECRET_PASS;
  const char* mqtt_server = MQTT_HOST;
  const int mqtt_port = 1883;
  const char* mqtt_user = MQTT_USER;
  const char* mqtt_pass = MQTT_PASS;

  MFRC522 mfrc522(SS_PIN, RST_PIN);
  WiFiClient espClient;
  PubSubClient client(espClient);
  Servo myServo; 

  // Timers and State
  unsigned long doorTimer = 0;
  bool doorOpen = false;
  unsigned long feedbackRedTimer = 0;
  bool feedbackRedActive = false;
  unsigned long buzzerTimer = 0;
  bool buzzerActive = false;
  unsigned long lastMqttRetry = 0;

  void setSystemStatus(bool ready) {
    if (ready) {
      digitalWrite(statusGreen, HIGH);
      digitalWrite(statusRed, LOW);
    } else {
      digitalWrite(statusGreen, LOW);
      digitalWrite(statusRed, HIGH);
    }
  }

  void callback(char* topic, byte* payload, unsigned int length) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, payload, length);
    if (error) return;

    String status = doc["data"];
    if (status == "unlock") {
      digitalWrite(ledFeedbackGreen, HIGH);
      myServo.write(120);
      doorTimer = millis();
      doorOpen = true;
    } else {
      digitalWrite(ledFeedbackRed, HIGH);
      feedbackRedTimer = millis();
      feedbackRedActive = true;
    }
  }

  void setup_wifi() {
    setSystemStatus(false); // Red on while connecting
    Serial.print("Connecting to WiFi");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("\nWiFi Connected");
  }

  void manageConnection() {
    if (!client.connected()) {
      setSystemStatus(false); // Switch to Red if MQTT drops
      unsigned long now = millis();
      if (now - lastMqttRetry > 5000) {
        lastMqttRetry = now;
        String clientId = "ESP32Client-" + String(random(0xffff), HEX);
        if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
          client.subscribe("door/command");
          Serial.println("MQTT Connected");
        }
      }
    } else {
      setSystemStatus(true); // Green when everything is connected
    }
  }

  void setup() {
    Serial.begin(115200);
    
    pinMode(statusRed, OUTPUT);
    pinMode(statusGreen, OUTPUT);
    pinMode(ledFeedbackRed, OUTPUT);
    pinMode(ledFeedbackGreen, OUTPUT);
    pinMode(buzzerPin, OUTPUT);

    setup_wifi();
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);

    SPI.begin(); 
    mfrc522.PCD_Init();

    myServo.setPeriodHertz(50); 
    myServo.attach(SERVO_PIN, 500, 2400); 
    myServo.write(60); 

    Serial.println("System Initialized");
  }

  void loop() {
    manageConnection();
    client.loop();

    unsigned long currentMillis = millis();

    // Non-blocking Timer: Door Close
    if (doorOpen && (currentMillis - doorTimer >= 3000)) {
      digitalWrite(ledFeedbackGreen, LOW);
      myServo.write(60);
      doorOpen = false;
    }

    // Non-blocking Timer: Error LED
    if (feedbackRedActive && (currentMillis - feedbackRedTimer >= 2000)) {
      digitalWrite(ledFeedbackRed, LOW);
      feedbackRedActive = false;
    }

    // Non-blocking Timer: Buzzer
    if (buzzerActive && (currentMillis - buzzerTimer >= 300)) {
      noTone(buzzerPin);
      buzzerActive = false;
    }

    // RFID Scanning
    if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
      return;
    }

    String uidString = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      uidString += (mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
      uidString += String(mfrc522.uid.uidByte[i], HEX);
    }
    uidString.toUpperCase();

    if (client.publish("door/rfid/scan", uidString.c_str())) {
      tone(buzzerPin, 500);
      buzzerTimer = millis();
      buzzerActive = true;
    }

    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
  }