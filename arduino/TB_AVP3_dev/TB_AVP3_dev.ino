
//Seleccionar el modulo:
#define TINY_GSM_MODEM_SIM800
// #define TINY_GSM_MODEM_SIM900

// Pines de comunicacion con modulo
#define PIN_TX    62
#define PIN_RX    63

// Baudrate para debugging
#define SERIAL_DEBUG_BAUD   115200

// Token de Thingsboard
#define TOKEN               "cmuZkINvXJF1yexP66Hk"
#define THINGSBOARD_SERVER  "ec2-3-101-90-91.us-west-1.compute.amazonaws.com"

//Tiempos de espera en milis
#define AC_WAIT 6000
#define Alr_WAIT 6000
#define Emg_WAIT 18000
#define Tone_WAIT 3000000
#define SPause_WAIT 500000
#define LPause_WAIT 1320000


//Inclusion de librerias
#include <TinyGsmClient.h>
#include <SoftwareSerial.h>
#include <RCSwitch.h>
#include <TimerOne.h>
#include <Wire.h>
#include <avr/wdt.h>
#include "ThingsBoard.h"

unsigned long controla[] = {9572225,
                            10728801};

unsigned long controlb[] = {9572226,
                            10728802};

int ncr = (sizeof(controla)/sizeof(controla[0]));

//Inicializacion de objeto para controles remoto
RCSwitch mySwitch = RCSwitch();

// Se inicia comunicacion serial por software a modulo
SoftwareSerial serialGsm(PIN_RX,PIN_TX); // RX, TX

// Inicializa modem
TinyGsm modem(serialGsm);

// Inicializa cliente GSM
TinyGsmClient client(modem);

// Inicializa instancia Thinsboard
ThingsBoard tb(client);

// APN de SIM: "em" para EMnify
const char apn[]  = "em";

// Bandera de estado de conexion
bool modemConnected = false;
// Bandera de subscipcion a RPCs
bool subscribed = false;


// Variables de estado
int crid;
bool active;
bool val_upt;
bool trig;
bool bat    = false;
bool rf     = false;
bool valid  = false;
bool warn   = false;
bool pause  = false;
unsigned long timestamp;
unsigned long ac_timestamp;

// Pines de comunicacion con modulos RF
int rf_Rx = 0; // int for Receive pin.
int rf_Tx = 6; // int for Transmit pin.

//Pines de salida
int led_brd = 13;
int Sirena        = 7;  // Pin para la Sirena
int Fuego         = 8;  // Pin Luz estroboscopica
int Reset_Pin     = 9;  // Pin de reinicio para SIM800L
int Sens_Carga    = 4;  // Pin Sensor monitor de enegia 120 V

//Llamados RPC desde el Server
RPC_Response activaAlarma(const RPC_Data &data){
  if(!active || warn){
    active = true;
    warn  = false;
    trig = true;
    Serial.println("Emergencia activada por server");
    return RPC_Response("Resultado", "Emergencia activa");
  } else {
    return RPC_Response("Error", "Alarma ya esta activada");
  }
}

RPC_Response activaAlerta(const RPC_Data &data){
  if(!active){
    active = true;
    warn  = true;
    trig = true;
    Serial.println("Alerta activada por server");
    return RPC_Response("Resultado", "Alerta activa");
  } else {
    return RPC_Response("Error", "No es posible revocar emergencia");
  }
}

RPC_Response desactivaAlarma(const RPC_Data &data){
  if(active){
    active = false;
    trig = true;
    Serial.println("Alarma apagada por server");
    return RPC_Response("Resultado","Alarma desactivada");
  } else {
    return RPC_Response("Error", "Alarma ya esta desactivada");
  }
}

RPC_Callback callbacks[] = {
  { "actEm", activaAlerta },
  { "actAl", activaAlarma },
  { "desAl", desactivaAlarma },
};

void setup() {
  // Baud rate para monitor serial
  Serial.begin(SERIAL_DEBUG_BAUD);

  // Comienza con baud rate predefinido
  serialGsm.begin(115200);
  delay(3000);

  //Comunicacion serial con modulo
  serialGsm.write("AT+IPR=9600\r\n");
  serialGsm.end();
  serialGsm.begin(9600);

  // Reinicia el modulo
  Serial.println(F("Inicializando modulo GSM..."));
  modem.restart();
  String modemInfo = modem.getModemInfo();
  Serial.print(F("Modulo: "));
  Serial.println(modemInfo);
  
  //Inicializa recepcion RF para controles
  mySwitch.enableReceive(rf_Rx);  // Receiver on
  mySwitch.setRepeatTransmit(12);

  //Utiliza la libreria Timer1 para el manejo del Timer 1 del ATMega2560
  Timer1.initialize();
  Timer1.attachInterrupt(timerIsr); 
  Timer1.stop();

  pinMode(Sens_Carga,INPUT);
  pinMode(Sirena,OUTPUT);
  pinMode(Fuego,OUTPUT);
  pinMode(Reset_Pin,OUTPUT);
  digitalWrite(Reset_Pin,HIGH);
  digitalWrite(Sirena,HIGH);
  digitalWrite(Fuego,HIGH);
  pinMode(led_brd,OUTPUT);
}

void loop() {
  if (!modem.isNetworkConnected()) modem_connect();
  if (!tb.connected()) tb_connect();
  if (mySwitch.available()) nremote();
  if(digitalRead(Sens_Carga)==bat) ACDC();
  if(active) timer();
  if(trig) upt_gpios();
  if(val_upt) tb_upt();
  tb.loop();
}

void modem_connect(){
  Serial.print(F("Esperando red..."));
  if (!modem.waitForNetwork()) {
      Serial.println(" error");
      delay(10000);
      return;
  }
  Serial.println(" OK");
  Serial.print(F("Conectando a "));
  Serial.print(apn);
  if (!modem.gprsConnect(apn)) {
    Serial.println(" error");
    delay(10000);
    return;
  }
  modemConnected = true;
  Serial.println(" OK");
}

void tb_connect(){ // Conecta a server de ThingsBoard
  Serial.print("Conectando a : ");
  Serial.print(THINGSBOARD_SERVER);
  Serial.print(" con token ");
  Serial.println(TOKEN);
  if (!tb.connect(THINGSBOARD_SERVER, TOKEN)) {
    Serial.println("Error de conexion");
    return;
  }
  if (!tb.RPC_Subscribe(callbacks,3)) {
    Serial.println("Error al subscribir RPC");
    return;
  }
}

void tb_upt(){
  tb.sendAttributeBool("Activo",active);
  tb.sendAttributeBool("Alerta",warn);
  tb.sendAttributeBool("Bateria",bat);
  if(rf) tb.sendAttributeInt("Control",crid);
  else tb.sendAttributeInt("Control",NULL);
  val_upt = false;
}

//////////////////////////////////////////////////////////////////
///////Funcion para el manejo de salidas y activar los repetidores
//////////////////////////////////////////////////////////////////
void upt_gpios(){
  mySwitch.disableReceive();         // Deshabilita la interrupcion de recepcion RF
  if(active){
    digitalWrite(led_brd,HIGH);
    if(!warn){                       //Modo de ALARMA
      Timer1.stop();
      Timer1.initialize(Tone_WAIT);
      digitalWrite(Sirena,LOW);
      timestamp = millis();
    } else {                            //Modo de ALERTA
      Timer1.stop();
      digitalWrite(Sirena,HIGH);
      digitalWrite(Fuego,LOW);
      pause = false;
      timestamp = millis();
      Timer1.initialize(SPause_WAIT);
    }
  } else {                              //Desactivacion
    Timer1.stop();
    digitalWrite(Sirena, HIGH);
    digitalWrite(Fuego, HIGH);
    digitalWrite(led_brd,LOW);
    warn = false;
    pause = false;
    timestamp = 0;
  }
  trig = false;
  val_upt = true;
  mySwitch.enableReceive(rf_Rx); // Habilita la recepcion por interrupcion de software
}

//////////////////////////////////////////////////////
//////////Funcion para revisar la señal entrante de RF 
//////////////////////////////////////////////////////
void nremote(){
   Serial.print("Control accionado");
   mySwitch.disableReceive();
   
   if(mySwitch.getReceivedBitlength()!=24){     //Codificacion de los controles remotos conocidos
      mySwitch.resetAvailable();
      mySwitch.enableReceive(rf_Rx);
      return;
   }

   unsigned long acr = mySwitch.getReceivedValue();
   
   if(!active || warn){ 
      for(int n = 0; n<ncr;n++){
        if(acr == controla[n]){
          crid = n;
          Serial.println("Alarma por control remoto ");
          Serial.print(crid);
          active = true; 
          warn = false;
          rf = true;
          upt_gpios();
          break;
        }
      }
   }
   if(!active){
    for(int n = 0; n<ncr;n++){
        if(acr == controlb[n]){
          crid = n;
          Serial.println("Alerta por control remoto ");
          Serial.print(crid);
          active = true; 
          warn = true;
          rf = true;
          upt_gpios();
          break;
      }
     }
   }
    mySwitch.resetAvailable();
    mySwitch.enableReceive(rf_Rx);
}

////////////////////////////////////////////////////////////////////////////////////
//////Funcion para revisar el nivel de pin de tarjeta de carga para detectar bateria
////////////////////////////////////////////////////////////////////////////////////
void ACDC(){
  if(millis()>ac_timestamp+AC_WAIT){
    if(digitalRead(Sens_Carga)){
      Serial.println("AC");
      bat=false;
    } else {
      Serial.println("DC");
      bat = true;
    }
    ac_timestamp = millis();
    val_upt = true;
  }
}

////////////////////////////////////////////////////
//// Funcion de temporizador para desactivar salidas
////////////////////////////////////////////////////
void timer(){
  if(warn && (millis()>timestamp+Alr_WAIT)){
      active = false;
      warn = false;
      pause = false;
      Timer1.stop();
      timestamp = 0;
      trig = true;
  }else if(millis()>timestamp+Emg_WAIT){
      active = false;
      warn = false;
      pause = false;
      Timer1.stop();
      timestamp = 0;
      trig = true;
  }
}

///////////////////////////////////////////////////////////////
/////Rutina de interrupcion para manejar los tonos de la sirena
///////////////////////////////////////////////////////////////
void timerIsr(){
    if(active && !warn){
    digitalWrite(Fuego, !digitalRead(Fuego)); 
    }else if(active && warn){
      if(!pause){
        digitalWrite(Fuego,HIGH);
        pause = true;
        Timer1.setPeriod(LPause_WAIT);
      }else{
        digitalWrite(Fuego,LOW);
        pause = false;
        Timer1.setPeriod(SPause_WAIT);
      }
    }
}
