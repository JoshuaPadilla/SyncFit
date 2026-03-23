#include <WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>

#include "secrets.h"

const char* ssid = SECRET_SSID;
const char* password = SECRET_PASS;
const char* mqtt_server = MQTT_HOST;
const int mqtt_port = 1883;
const char* mqtt_user = MQTT_USER;
const char* mqtt_pass = MQTT_PASS;

const int buzzerPin = 14;
const int red = 2;
const int green = 47;
const int mqttIndicator = 4;
const int wifiIndicator = 5;

#define SERVO_PIN 38
#define SS_PIN 10
#define RST_PIN 6

MFRC522 mfrc522(SS_PIN, RST_PIN);
WiFiClient espClient;
PubSubClient client(espClient);

unsigned long doorTimer = 0;
bool doorOpen = false;

unsigned long redTimer = 0;
bool redActive = false;

unsigned long buzzerTimer = 0;
bool buzzerActive = false;

void servoWrite(int degrees) {
  // Map 0-180 degrees to 500-2400 microsecond pulse widths
  int pulseWidth = map(degrees, 0, 180, 500, 2400);
  // Native Core 3.0+ command
  ledcWrite(SERVO_PIN, pulseWidth); 
}

void callback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<200> doc;
  deserializeJson(doc, payload, length);

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
  WiFi.setSleep(false);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  digitalWrite(wifiIndicator, HIGH);
  Serial.println("\nNetwork connected");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  digitalWrite(mqttIndicator, LOW);
  while (!client.connected()) {
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      client.subscribe("gym/door/command");
      digitalWrite(mqttIndicator, HIGH);
    } else {
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("System starting");

  pinMode(wifiIndicator, OUTPUT);
  pinMode(mqttIndicator, OUTPUT);
  pinMode(red, OUTPUT);
  pinMode(green, OUTPUT);

  setup_wifi();

  Serial.println("Configuring MQTT");
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  Serial.println("Starting SPI");
  SPI.begin(12, 13, 11, 10);
  
  Serial.println("Initializing MFRC522");
  mfrc522.PCD_Init();

  Serial.println("Attaching Servo");
  // Frequency 50Hz, Resolution 14-bit for smooth control
  ledcAttach(SERVO_PIN, 50, 14); 
  
  servoWrite(60); // Set initial closed position

  Serial.println("System is Ready");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long currentMillis = millis();

  // Non-blocking door timer
  if (doorOpen && (currentMillis - doorTimer >= 3000)) {
    digitalWrite(green, LOW);
    servoWrite(60);
    doorOpen = false;
  }

  // Non-blocking LED timer
  if (redActive && (currentMillis - redTimer >= 2000)) {
    digitalWrite(red, LOW);
    redActive = false;
  }

  // Non-blocking beep sound
  if (buzzerActive && (currentMillis - buzzerTimer >= 300)) {
  noTone(buzzerPin);
  buzzerActive = false;
}

  // Check RFID
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  String uidString = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uidString += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    uidString += String(mfrc522.uid.uidByte[i], HEX);
  }
  uidString.toUpperCase();

  Serial.print("Tag Scanned: ");
  Serial.println(uidString);

  if (client.publish("gym/rfid/scan", uidString.c_str())) {
    tapSound();
  }

  mfrc522.PICC_HaltA();
}

void tapSound() {
  tone(buzzerPin, 500);
  buzzerTimer = millis();
  buzzerActive = true;
}