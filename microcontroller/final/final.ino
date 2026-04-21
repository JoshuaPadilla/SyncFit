#include <WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

#include "secrets.h"

// Constants from secrets.h
const char* ssid = SECRET_SSID;
const char* password = SECRET_PASS;
const char* mqtt_server = MQTT_HOST;
const int mqtt_port = 1883;
const char* mqtt_user = MQTT_USER;
const char* mqtt_pass = MQTT_PASS;


const int buzzerPin = 14;
const int red = 2;        // Built-in LED on many boards
const int green = 12;     // Changed from 47 (S3 only)
const int mqttIndicator = 4;
const int wifiIndicator = 5;

#define SERVO_PIN 13      
#define SS_PIN 21        
#define RST_PIN 22       

MFRC522 mfrc522(SS_PIN, RST_PIN);
WiFiClient espClient;
PubSubClient client(espClient);
Servo myServo; 

unsigned long doorTimer = 0;
bool doorOpen = false;
unsigned long redTimer = 0;
bool redActive = false;
unsigned long buzzerTimer = 0;
bool buzzerActive = false;

void servoWrite(int degrees) {
  myServo.write(degrees);
}

void callback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  if (error) return;

  String status = doc["data"];
  Serial.print("Status received: ");
  Serial.println(status);

  if (status == "unlock") {
    digitalWrite(green, HIGH);
    servoWrite(120);
    doorTimer = millis();
    doorOpen = true;
  } else {
    Serial.println("Access Denied");
    digitalWrite(red, HIGH);
    redTimer = millis();
    redActive = true;
  }
}

void setup_wifi() {
  digitalWrite(wifiIndicator, LOW);
  Serial.print("Connecting to network");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  digitalWrite(wifiIndicator, HIGH);
  Serial.println("\nNetwork connected");
}

void reconnect() {
  digitalWrite(mqttIndicator, LOW);
  while (!client.connected()) {
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      client.subscribe("door/command");
      digitalWrite(mqttIndicator, HIGH);
    } else {
      delay(5000);
    }
  }
}

void tapSound() {
  tone(buzzerPin, 500);
  buzzerTimer = millis();
  buzzerActive = true;
}

void setup() {
  Serial.begin(115200);
  
  pinMode(wifiIndicator, OUTPUT);
  pinMode(mqttIndicator, OUTPUT);
  pinMode(red, OUTPUT);
  pinMode(green, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  setup_wifi();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  // Standard ESP32 hardware SPI: SCK=18, MISO=19, MOSI=23, SS=21
  SPI.begin(); 
  mfrc522.PCD_Init();

  myServo.setPeriodHertz(50); 
  myServo.attach(SERVO_PIN, 500, 2400); 
  
  servoWrite(60); // Initial closed position
  Serial.println("System Ready");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long currentMillis = millis();

  if (doorOpen && (currentMillis - doorTimer >= 3000)) {
    digitalWrite(green, LOW);
    servoWrite(60);
    doorOpen = false;
  }

  if (redActive && (currentMillis - redTimer >= 2000)) {
    digitalWrite(red, LOW);
    redActive = false;
  }

  if (buzzerActive && (currentMillis - buzzerTimer >= 300)) {
    noTone(buzzerPin);
    buzzerActive = false;
  }

  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  String uidString = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uidString += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    uidString += String(mfrc522.uid.uidByte[i], HEX);
  }
  uidString.toUpperCase();

  if (client.publish("door/rfid/scan", uidString.c_str())) {
    tapSound();
  }

  mfrc522.PICC_HaltA();
}