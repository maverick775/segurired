//Definiciones principales
#define ID_ALARMA 123546
#define PING      11111
#define U_ONREP   55555
#define U_OFFREP  99999

//Seleccionar el modulo:
#define TINY_GSM_MODEM_SIM800

// Pines de comunicacion con modulo
#define SerialAT Serial1

// Pines de comunicacion con modulos RF
#define rf_Rx  0 // int for Receive pin.
#define rf_Tx  6 // int for Transmit pin.

// Baudrate para debugging
#define SERIAL_DEBUG_BAUD   115200
#define MODEM_BAUD   57600

// Token de Thingsboard
#define TOKEN               "cmuZkINvXJF1yexP66Hk"
#define THINGSBOARD_SERVER  "seguri-red.ddns.net"

//Tiempos de espera en milis
#define REFRESH 15000
#define TIMESUP 600000 // Cada 10 minutos
#define MOD_MAXWAIT 90000
#define AC_WAIT 60000
#define Alr_WAIT 60000
#define Emg_WAIT 180000
#define Tone_WAIT 3000000
#define SPause_WAIT 500000
#define LPause_WAIT 1320000


//Inclusion de librerias
#include <TinyGsmClient.h>
#include <RCSwitch.h>
#include <TimerOne.h>
#include <Wire.h>
#include <avr/wdt.h>
#include "ThingsBoard.h"

unsigned long controla[] = {13391296,5723584};

unsigned long controlb[] = {13391152,5723440};

int ncr = (sizeof(controla)/sizeof(controla[0]));

//Inicializacion de objeto para controles remoto
RCSwitch mySwitch = RCSwitch();

TinyGsm modem(Serial1);

// Inicializa cliente GSM
TinyGsmClient client(modem);


// Inicializa instancia Thinsboard
ThingsBoardSized<128>  tb(client);

// APN de SIM: "em" para EMnify
const char apn[]  = "em";

// Bandera de estado de conexion
bool modemConnected = false;
// Bandera de subscipcion a RPCs
bool subscribed = false;


// Variables de estado
volatile bool val_upt = false;
volatile bool active = false;
volatile bool warn   = false;
volatile bool change = false;
volatile bool mute = false;
volatile int tmode = 0;
bool bat    = false;
bool rf     = false;
bool valid  = false;
bool ttpause = false;
bool spause  = false;
String crid;

unsigned long gtimestamp;
unsigned long ac_timestamp;
unsigned long gsm_timestamp;
unsigned long cnt_timestamp;
unsigned long mute_timestamp;


//Pines de salida
int led_brd   = 13;
int Sirena        = 7;  // Pin para la Sirena
int Fuego         = 8;  // Pin Luz estroboscopica
int Reset_Pin     = 9;  // Pin de reinicio para SIM800L
int Sens_Carga    = 4;  // Pin Sensor monitor de enegia 120 V

//Software reset
void softwareReset(uint8_t prescaller){
  wdt_enable(prescaller);
  while(1){}
}

//Llamados RPC desde el Server
RPC_Response set_state(const RPC_Data &data){
  bool trigger = data["trigger"];
  bool emg = data["emg"];
  Serial.println(trigger);
  Serial.println(emg);
  if(trigger && emg){
    if(!active || warn){
      active = true;
      warn  = false;
      change = true;
      val_upt = true;
      Serial.println("Emergencia activada por server");
      return RPC_Response("Resultado", "Emergencia activa");
    } else {
      return RPC_Response("Error", "Alarma ya esta activada");
    }
  } else if(trigger && !emg){
    if(!active){
      active = true;
      warn  = true;
      change = true;
      val_upt = true;
      Serial.println("Alerta activada por server");
      return RPC_Response("Resultado", "Alerta activa");
    } else {
    return RPC_Response("Error", "No es posible revocar emergencia");
    } 
  } else {
    if(active){
      active = false;
      change = true;
      val_upt = true;
      Serial.println("Alarma apagada por server");
      return RPC_Response("Resultado","Alarma desactivada");
  } else {
    return RPC_Response("Error", "Alarma ya esta desactivada");
    }
  }
}

RPC_Response run_mode(const RPC_Data &data){
  String function = data["function"];
  int secs = data["secs"];
  Serial.println(function);
  Serial.println(secs);
  if(active){
    return RPC_Response("Error", "ALARMA esta activa");
  }
  if(function.equals("test_siren")){
    tmode = 1;
    return RPC_Response("Resultado", "Se ejecuta secuencia de PRUEBAS con Sirena");
  }
  else if (function.equals("ping")){
    tmode = 2;
    return RPC_Response("Resultado", "Localizando repetidores cercanos");
  }
  else if (function.equals("reset")){
      softwareReset(WDTO_60MS);
      //gprs.powerReset(Reset_Pin);
      return RPC_Response("Resultado", "Reiniciando sistema");
    }
  else if(function.equals("test_mode")){
      if(!mute){
        mute = true;
        val_upt = true;
        mute_timestamp = millis();
        return RPC_Response("Resultado", "Estado mudo: Sirenas deshabilitadas por 10 minutos");
      } else {
        mute = false;
        val_upt = true;
        return RPC_Response("Resultado", "Estado mudo revocado: Sirenas habilitadas");
      }
  }
  else{
    return RPC_Response("Error","Error: no se reconoce comando");
  }
}

RPC_Response update_params(const RPC_Data &data){
  
}

RPC_Callback callbacks[] = {
  { "set_state", set_state },
  { "run_mode", run_mode },
  { "upt_params", update_params },
};

void setup() {
  Serial.begin(SERIAL_DEBUG_BAUD);
  Serial1.begin(57600);
  modem.restart();
  delay(3000);
  if(!modem.init()){
    if(!Serial.available()) { //revisar la comunicacion del modulo
      //Comunicacion serial con modulo
      Serial.println("Inicializando modulo GSM...");
      TinyGsmAutoBaud(Serial1, 9600, 57600);
      return;
    }
  }
  modem_setup();
  String modemInfo = modem.getModemInfo();
  Serial.print(F("Modulo: "));
  Serial.println(modemInfo);
  Serial.println("Iniciado exitosamente");
  
  //Inicializa recepcion RF para controles
  mySwitch.enableReceive(rf_Rx);  // Receiver on
  mySwitch.setRepeatTransmit(20);

  //Utiliza la libreria Timer1 para el manejo del Timer 1 del ATMega2560
  Timer1.initialize();
  Timer1.attachInterrupt(timerIsr); 
  Timer1.stop();

  pinMode(Sens_Carga,INPUT);
  pinMode(Sirena,OUTPUT);
  pinMode(Fuego,OUTPUT);
  pinMode(Reset_Pin,OUTPUT);
  pinMode(led_brd,OUTPUT);
  digitalWrite(Reset_Pin,HIGH);
  digitalWrite(Sirena,HIGH);
  digitalWrite(Fuego,HIGH);
}

void loop() {
  if(change) upt_gpios();
  if(mySwitch.available()) nremote();
  if(digitalRead(Sens_Carga)==bat) ACDC();
  if(val_upt) tb_upt();
  if(active) timer();
  if(tmode > 0) tool_mode(tmode);
  if(mute && millis() > mute_timestamp + TIMESUP){
    mute = false;
    tb_upt();
    Serial.println("Modo pruebas expirado");
  }
  if(!modemConnected && millis()>cnt_timestamp+REFRESH) modem_setup();
  else if(modemConnected) check_connection(); 
  tb.loop();   
}

void check_connection(){ 
  if (!modem.isGprsConnected()){
    Serial.println("Error en modem");
    modemConnected = false;
    gsm_timestamp = millis();
    cnt_timestamp = millis();
  }
  else if (!tb.connected()) {
    Serial.println("Server desconectado");
    modemConnected = false;
    cnt_timestamp = millis();
  }
}

void modem_setup(){ 
  if(!modem.isNetworkConnected()){
    Serial.println("Falta de registro en red celular");
    if(millis()>gsm_timestamp+MOD_MAXWAIT){
      Serial.println("Reiniciando modulo GSM...");
      modem.restart();
      return;
    }
    cnt_timestamp = millis();
    return;
  }     
  Serial.println("Modem OK");
  if(!modem.isGprsConnected()){
    Serial.print(F("Conectando a "));
    Serial.print(apn);
    if (!modem.gprsConnect(apn)) {
      Serial.println(" error");
      cnt_timestamp = millis();
      return;
    }
  }
  Serial.println(" OK");
  if(!tb.connected()){
    Serial.print("Conectando a : ");
    Serial.print(THINGSBOARD_SERVER);
    Serial.print(" con token ");
    Serial.println(TOKEN);
    subscribed = false;
    if(!tb.connect(THINGSBOARD_SERVER, TOKEN)) {
      Serial.println("Error de conexion con server");
      cnt_timestamp = millis();
      return;
    } 
  }
  if(!subscribed) {
    if (!tb.RPC_Subscribe(callbacks,3)) {
      Serial.println("Error al subscribir RPC");
      cnt_timestamp = millis();
      return;
    } 
  }
  subscribed = true;
  modemConnected = true;
  Serial.println("Server OK");
  tb_upt();
}

void tb_upt(){
  bool emg = active&!warn;
  if(!tb.connected()) return;
  const int attribute_items = 4;
  int len = crid.length() + 1;
  char rc_id[len];
  crid.toCharArray(rc_id,len);
  if(!rf||!active) crid = "";
  Attribute attributes[attribute_items] = {
    { "Triggered", active},
    { "Emergency", emg},
    { "Battery", bat},
    { "Mute", mute},
  };
  val_upt = !(tb.sendAttributes(attributes, attribute_items)&&tb.sendAttributeString("RC_ID", rc_id));
  Serial.println("Atributos de ThinsgBoard actualizados");
}

//////////////////////////////////////////////////////////////////
///////Funcion para el manejo de salidas y activar los repetidores
//////////////////////////////////////////////////////////////////
void upt_gpios(){
  if(mute){
    tb_upt();
    ttpause = false;
    active = false;
    warn = false;
    Serial.println("Mudo");
    return;
  }
  if(active){
    if(!warn){                       //Modo de ALARMA
      Timer1.stop();
      Timer1.initialize(Tone_WAIT);
      digitalWrite(Sirena,LOW);
      repeater(U_ONREP);
    } else {                            //Modo de ALERTA
      Timer1.stop();
      digitalWrite(Sirena,HIGH);
      digitalWrite(Fuego,LOW);
      ttpause = false;
      Timer1.initialize(SPause_WAIT);
    }
    gtimestamp = millis();
  } else {                              //Desactivacion
    Timer1.stop();
    digitalWrite(Sirena, HIGH);
    digitalWrite(Fuego, HIGH);
    repeater(U_OFFREP);
    rf = false;
    warn = false;
    ttpause = false;
  }
  Serial.println("Salidas actualizadas");
  change = false;
  val_upt = true;
}

//////////////////////////////////////////////////////
//////////Funcion para revisar la señal entrante de RF 
//////////////////////////////////////////////////////
void nremote(){
   Serial.println("Control recibido");
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
          crid = String(acr);
          Serial.println("Alarma por control remoto ");
          Serial.println(crid);
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
          crid = String(acr);
          Serial.println("Alerta por control remoto ");
          Serial.println(crid);
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
  if(warn && (millis()>gtimestamp+Alr_WAIT)){
      rf = false;
      warn = false;
      active = false;
      spause = false;
      val_upt = true;
      Timer1.stop();
      gtimestamp = 0;
      upt_gpios();
  }else if(millis()>gtimestamp+Emg_WAIT){
      rf = false;
      warn = false;
      active = false;
      spause = false;
      val_upt = true;
      Timer1.stop();
      gtimestamp = 0;
      upt_gpios();
  }
}

///////////////////////////////////////////////////////////////
/////Rutina de interrupcion para manejar los tonos de la sirena
///////////////////////////////////////////////////////////////
void timerIsr(){
  if(active && !warn){
    digitalWrite(Fuego, !digitalRead(Fuego)); 
    }else if(active && warn){
      if(!ttpause){
        digitalWrite(Fuego,HIGH);
        ttpause = true;
        Timer1.setPeriod(LPause_WAIT);
      }else{
        digitalWrite(Fuego,LOW);
        ttpause = false;
        Timer1.setPeriod(SPause_WAIT);
      }
    }
}

///////////////////////////////////////////////////////
///////Funciones extra para pruebas
///////////////////////////////////////////////////////
void tool_mode(int tid){
  switch(tid){
    case 1: //rutina de prueba de sirenas
      digitalWrite(Sirena,LOW);
      delay(3500);
      digitalWrite(Sirena,HIGH);
      digitalWrite(Fuego,LOW);
      delay(3500);
      digitalWrite(Fuego,HIGH);
      break;
    case 2:
      repeater(PING);
      break;
  }
  tmode = 0;
}
///////////////////////////////////////////////////////
///////Funcion para transmitir codigos a los repetidores
///////////////////////////////////////////////////////
void repeater(int transmint){
  mySwitch.disableReceive();         // Deshabilita la interrupcion de recepcion RF
  mySwitch.enableTransmit(rf_Tx);
  for(int i=0; i<3; i++){
    mySwitch.send(transmint,16);
    delay(150);
  }
  mySwitch.disableTransmit();
  mySwitch.enableReceive(rf_Rx); // Habilita la recepcion por interrupcion de software
}
