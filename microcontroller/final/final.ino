#include <WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>

#include "secrets.h"

// --- Configuration ---
const char* ssid        = SECRET_SSID;
const char* password    = SECRET_PASS;
const char* mqtt_server = MQTT_HOST; 
const int   mqtt_port   = 1883;
const char* mqtt_user   = MQTT_USER;
const char* mqtt_pass   = MQTT_PASS;


const int buzzerPin = 14;
const int servoPin = 18;
const int red = 2;
const int green = 47;
bool shouldBlinkGreen = false;
bool shouldBlinkRed = false;

// --- Hardware Pins ---
#define SS_PIN  10
#define RST_PIN 1

MFRC522 mfrc522(SS_PIN, RST_PIN);
WiFiClient espClient;
PubSubClient client(espClient);
Servo myServo;

void callback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<200> doc;
  deserializeJson(doc, payload, length);
  
  // Extract the "data" field from the JSON
  String status = doc["data"]; 
  
  Serial.print("Status received: ");
  Serial.println(status);

  if (status == "unlock") {
    shouldBlinkGreen = true;
  } else {
    Serial.println("Access Denied");
    shouldBlinkRed = true;
  }
}


void setup_wifi() {
  delay(10);
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected. IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      client.subscribe("gym/door/command");
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  pinMode(red, OUTPUT);
  pinMode(green, OUTPUT);
  // ESP32PWM::allocateTimer(0);
  // myServo.setPeriodHertz(50);    // Standard 50hz servo
  // myServo.attach(servoPin, 500, 2400); // Attach with min/max pulse widths


  SPI.begin();           
  mfrc522.PCD_Init();    
  Serial.println("Scan an RFID tag...");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  if (shouldBlinkGreen) {
    blinkLed(green, 2000);
    shouldBlinkGreen = false;
  }
  if (shouldBlinkRed) {
    blinkLed(red, 2000);
    shouldBlinkRed = false;
  }

  // Look for new cards
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  // Read UID
  String uidString = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uidString += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    uidString += String(mfrc522.uid.uidByte[i], HEX);
  }
  uidString.toUpperCase();

  Serial.print("Tag Scanned: ");
  Serial.println(uidString);



  // Publish to your VPS
  if (client.publish("gym/rfid/scan", uidString.c_str())) {
    tapSound();
    Serial.println("Data sent to VPS successfully");
  } else {
    tapSound();
    Serial.println("Data failed to send");
  }

  // Halt PICC
  mfrc522.PICC_HaltA();
}


void tapSound() {
  tone(buzzerPin, 500); // Send 1KHz sound signal...
  delay(300);        // ...for 1 sec
  noTone(buzzerPin);     // Stop sound...
}



void callBackSound() {
  tone(buzzerPin, 800); // Send 1KHz sound signal...
  delay(1000);        // ...for 1 sec
  noTone(buzzerPin);     // Stop sound...
}

void blinkLed(int pin, int duration) {
  digitalWrite(pin, HIGH);
  delay(duration);
  digitalWrite(pin, LOW);
  delay(duration);
}














