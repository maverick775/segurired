// This sketch demonstrates connecting and sending telemetry
// using ThingsBoard SDK and GSM modem, such as SIM900
//
// Hardware:
//  - Arduino Uno
//  - SIM900 Arduino shield connected to Arduino Uno

// Select your modem:
#define TINY_GSM_MODEM_SIM800
// #define TINY_GSM_MODEM_SIM808
// #define TINY_GSM_MODEM_SIM900
// #define TINY_GSM_MODEM_UBLOX
// #define TINY_GSM_MODEM_BG96
// #define TINY_GSM_MODEM_A6
// #define TINY_GSM_MODEM_A7
// #define TINY_GSM_MODEM_M590
// #define TINY_GSM_MODEM_ESP8266

#include <TinyGsmClient.h>
#include <SoftwareSerial.h>
#include "ThingsBoard.h"

// Your GPRS credentials
// Leave empty, if missing user or pass
const char apn[]  = "em";
const char user[] = "";
const char pass[] = "";

// See https://thingsboard.io/docs/getting-started-guides/helloworld/
// to understand how to obtain an access token
#define TOKEN               "cmuZkINvXJF1yexP66Hk"
#define THINGSBOARD_SERVER  "ec2-3-101-90-91.us-west-1.compute.amazonaws.com"

// Baud rate for debug serial
#define SERIAL_DEBUG_BAUD   115200

// Serial port for GSM shield
SoftwareSerial serialGsm(62,63); // RX, TX pins for communicating with modem

// Initialize GSM modem
TinyGsm modem(serialGsm);

// Initialize GSM client
TinyGsmClient client(modem);

// Initialize ThingsBoard instance
ThingsBoard tb(client);

// Set to true, if modem is connected
bool modemConnected = false;
// Set to true if application is subscribed for the RPC messages.
bool subscribed = false;
//Alarm status
bool state;

RPC_Response activaAlarma(const RPC_Data &data)
{
  state = true;
  digitalWrite(13,state);
  Serial.println("Alarma activa");
  //tb.sendAttributeBool("Emergencia",state);
  //delay(100);
  return RPC_Response("Resultado", "Emergencia activa");
}

RPC_Response desactivaAlarma(const RPC_Data &data)
{
  state = false;
  digitalWrite(13,state);
  Serial.println("Alarma apagada");
  //tb.sendAttributeBool("Emergencia",state);
  //delay(100);
  return RPC_Response("Resultado","Alarma desactivada");
}

RPC_Callback callbacks[] = {
  { "actAl", activaAlarma },
  { "desAl", desactivaAlarma },
};

void setup() {
  pinMode(13,OUTPUT);
  // Set console baud rate
  Serial.begin(SERIAL_DEBUG_BAUD);

  // Set GSM module baud rate
  serialGsm.begin(115200);
  delay(3000);

  // Lower baud rate of the modem.
  // This is highly practical for Uno board, since SoftwareSerial there
  // works too slow to receive a modem data.
  serialGsm.write("AT+IPR=9600\r\n");
  serialGsm.end();
  serialGsm.begin(9600);

  // Restart takes quite some time
  // To skip it, call init() instead of restart()
  Serial.println(F("Initializing modem..."));
  modem.restart();

  String modemInfo = modem.getModemInfo();
  Serial.print(F("Modem: "));
  Serial.println(modemInfo);

  // Unlock your SIM card with a PIN
  //modem.simUnlock("1234");
}

void loop() {
  delay(1000);
  if (!modem.isNetworkConnected()) {
    Serial.print(F("Waiting for network..."));
    if (!modem.waitForNetwork()) {
        Serial.println(" fail");
        delay(10000);
        return;
    }
    Serial.println(" OK");

    Serial.print(F("Connecting to "));
    Serial.print(apn);
    if (!modem.gprsConnect(apn, user, pass)) {
        Serial.println(" fail");
        delay(10000);
        return;
    }

    //modemConnected = true;
    Serial.println(" OK");
  }

  if (!tb.connected()) {
    // Connect to the ThingsBoard
    Serial.print("Connecting to: ");
    Serial.print(THINGSBOARD_SERVER);
    Serial.print(" with token ");
    Serial.println(TOKEN);
    if (!tb.connect(THINGSBOARD_SERVER, TOKEN)) {
      Serial.println("Failed to connect");
      return;
    }
    if (!tb.RPC_Subscribe(callbacks, 2)) {
      Serial.println("Failed to subscribe for RPC");
      return;
    }
  }
  //Serial.println("Sending data...");
  // Uploads new telemetry to ThingsBoard using MQTT.
  // See https://thingsboard.io/docs/reference/mqtt-api/#telemetry-upload-api
  // for more details

  //tb.sendTelemetryInt("Temperature",random(5,72));
  tb.loop();
}
