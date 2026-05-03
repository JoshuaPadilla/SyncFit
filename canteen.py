import network
import time
from machine import Pin, PWM, I2C, SPI
from umqtt.robust import MQTTClient
import machine
import ubinascii
from i2c_lcd import I2cLcd
from lcd_api import LcdApi
from mfrc522 import MFRC522

# ===== Wi-Fi Credentials =====
SSID = "Redmi 14C"
PASSWORD = "Rosiee_06082003"

# ===== MQTT Configuration =====
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_CLIENT_ID = b"esp32_alarm_" + ubinascii.hexlify(machine.unique_id())

# 🔥 SEPARATE TOPIC FOR PAYMENT STATUS
MQTT_TOPIC_STATUS = b"resto/payment/status"
payment_count = 0
MQTT_TOPIC_COMMAND = b"resto/payment/command"

# ===== Setup LED and Buzzer =====
led = Pin(15, Pin.OUT)
buzzer = PWM(Pin(2))
buzzer.duty_u16(0)

# ===== Setup I2C LCD =====
i2c = I2C(0, sda=Pin(21), scl=Pin(22), freq=400000)
devices = i2c.scan()

if len(devices) == 0:
    print("No I2C LCD found! Check wiring.")
    lcd = None
else:
    lcd_address = devices[0]
    lcd = I2cLcd(i2c, lcd_address, 2, 16)
    lcd.clear()
    lcd.putstr("System Ready")

# ===== Setup RFID RC522 =====
spi = SPI(2, baudrate=500000, polarity=0, phase=0,
          sck=Pin(18), mosi=Pin(23), miso=Pin(19))
rdr = MFRC522(spi=spi, gpioRst=Pin(4), gpioCs=Pin(5))

# ===== Update LCD =====
def update_lcd(message):
    if lcd:
        lcd.clear()
        lcd.putstr(message)

# ===== Buzzer Helper =====
def buzzer_beep(duration=0.5):
    buzzer.freq(2500)
    buzzer.duty_u16(60000)
    time.sleep(duration)
    buzzer.duty_u16(0)

# ===== MQTT PUBLISH PAYMENT =====
def publish_payment(uid_str):
    global payment_count
    payment_count += 1

    try:
        msg = "Payment #" + str(payment_count) + " | SUCCESS | UID: " + uid_str
        client.publish(MQTT_TOPIC_STATUS, msg)
        print("MQTT Published:", msg)
    except Exception as e:
        print("MQTT publish failed:", e)
# ===== Handle MQTT commands =====
def handle_command(cmd):
    cmd = cmd.lower()
    if cmd == "on":
        led.value(1)
        buzzer_beep()
        update_lcd("Payment Successful")
    elif cmd == "off":
        led.value(0)
        update_lcd("System Ready")
    elif cmd == "beep":
        buzzer_beep()
    elif cmd == "alarm":
        led.value(1)
        buzzer_beep()
        led.value(0)
        update_lcd("System Ready")
    elif cmd == "stop":
        led.value(0)
        update_lcd("System Ready")
    else:
        print("Unknown command:", cmd)

def mqtt_callback(topic, msg):
    print("MQTT message received:", msg.decode())
    handle_command(msg.decode())

# ===== Wi-Fi Connect =====
def connect_wifi():
    wifi = network.WLAN(network.STA_IF)
    wifi.active(True)
    wifi.connect(SSID, PASSWORD)
    print("Connecting to Wi-Fi...", end="")
    for _ in range(15):
        if wifi.isconnected():
            print("\nWi-Fi Connected! IP:", wifi.ifconfig()[0])
            return True
        print(".", end="")
        time.sleep(1)
    print("\nWi-Fi connection failed")
    return False

# ===== MQTT Connect =====
def connect_mqtt():
    client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER, port=MQTT_PORT)
    client.set_callback(mqtt_callback)
    client.connect()
    client.subscribe(MQTT_TOPIC_COMMAND)
    print("MQTT Connected and Subscribed")
    return client

# ===== MAIN =====
if not connect_wifi():
    raise SystemExit

client = connect_mqtt()
print("System Ready. Waiting for card or MQTT commands...")

while True:
    # ----- MQTT CHECK -----
    try:
        client.check_msg()
    except OSError as e:
        print("MQTT disconnected, reconnecting...", e)
        time.sleep(5)
        client = connect_mqtt()

    # ----- RFID DETECTION -----
    (stat, tag_type) = rdr.request(rdr.REQIDL)
    if stat == rdr.OK:
        (stat, uid) = rdr.anticoll()
        if stat == rdr.OK:
            uid_str = ":".join("%02X" % x for x in uid)
            print("Card detected! UID:", uid_str)

            # LED ON
            led.value(1)

            # Buzzer
            buzzer_beep(0.5)

            # LCD
            update_lcd("PAYMENT SUCCESS")

            # 🔥 SEND TO MQTT BROKER
            publish_payment(uid_str)

            # Delay
            time.sleep(2)

            # Reset
            led.value(0)
            update_lcd("System Ready")

    time.sleep(0.1)