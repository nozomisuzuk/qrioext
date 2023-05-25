/*
 * WebSocketClient.ino
 *
 *  Created on: 24.05.2015
 *
 */

#include <Arduino.h>

#include <WiFi.h>
//#include <WiFiMulti.h>
#include <WiFiClientSecure.h>

#include <WebSocketsClient.h>


//WiFiMulti WiFiMulti;
WebSocketsClient webSocket;

#define USE_SERIAL Serial

#define SSID "ssid15"
#define password "oic15oic15"
#define ws "192.168.2.98"
//#define ws "192.168.2.184"
const IPAddress ip(192,168,2,97);
//const IPAddress ip(192,168,2,110);
const IPAddress subnet(255,255,255,0);

#define LED_SWITCH      26
//#define LED_SWITCH_lock 27
#define Check_LED       17

unsigned long previousMillis = 0;
unsigned long interval = 30000;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  //char* st;
  String myString;
	switch(type) {
		case WStype_DISCONNECTED:
			USE_SERIAL.printf("[WSc] Disconnected!\n");
			break;
		case WStype_CONNECTED:
			USE_SERIAL.printf("[WSc] Connected to url: %s\n", payload);

			// send message to server when Connected
			webSocket.sendTXT("Hello Server");
			break;
		case WStype_TEXT:
			USE_SERIAL.printf("[WSc] get text: %s\n", payload);
      //st = (char *) payload;
      myString = String((char *) payload);
      
      if(myString == "message:do"){
        Serial.println("unlock");
        digitalWrite(LED_SWITCH, HIGH);
        delay(150);
        digitalWrite(LED_SWITCH, LOW);
        webSocket.sendTXT("esp32:unlock");
      }   
//      else if(myString == "message:off"){
//      　digitalWrite(LED_SWITCH_lock, HIGH);
//      　delay(150);
//      　digitalWrite(LED_SWITCH_lock, LOW);
//    　} 
      else if(myString == "message:state-check"){
        webSocket.sendTXT("esp32ok");
      }
			break;
		case WStype_BIN:
		case WStype_ERROR:			
		case WStype_FRAGMENT_TEXT_START:
		case WStype_FRAGMENT_BIN_START:
		case WStype_FRAGMENT:
		case WStype_FRAGMENT_FIN:
			break;
	}

}

void setup() {
	USE_SERIAL.begin(115200);
 
     pinMode(LED_SWITCH, OUTPUT);
//    pinMode(LED_SWITCH_lock, OUTPUT);
    pinMode(Check_LED,  OUTPUT);
    digitalWrite(Check_LED, HIGH);
    delay(100);
    digitalWrite(Check_LED, LOW);

	//Serial.setDebugOutput(true);
	USE_SERIAL.setDebugOutput(true);

	USE_SERIAL.println();
	USE_SERIAL.println();
	USE_SERIAL.println();

	for(uint8_t t = 4; t > 0; t--) {
		USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
		USE_SERIAL.flush();
		delay(1000);
	}
  
  if (!WiFi.config(ip,ip,subnet)){
    Serial.println("Failed to configure!");
  }

  WiFi.disconnect();
//	WiFiMulti.addAP(SSID, password);
  WiFi.begin(SSID,password);

  int count=0;
//	while(WiFiMulti.run() != WL_CONNECTED) {
  while(WiFi.status() != WL_CONNECTED){
    delay(1000);
    Serial.println("Connecting to WiFi..");
    count +=1;
    if(count >5){
      digitalWrite(Check_LED, HIGH);
      delay(100);
      digitalWrite(Check_LED, LOW);
      ESP.restart();
    }
	 }
   
  // Print ESP Local IP Address
  Serial.println(WiFi.localIP());

	// server address, port and URL
	webSocket.begin(ws, 3000, "/");

	// event handler
	webSocket.onEvent(webSocketEvent);

	// try ever 5000 again if connection has failed
	webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
  
  unsigned long currentMillis = millis();
  // if WiFi is down, try reconnecting every CHECK_WIFI_TIME seconds
  if ((WiFi.status() != WL_CONNECTED) && (currentMillis - previousMillis >=interval)) {
    Serial.print(millis());
    Serial.println("Reconnecting to WiFi...");
    WiFi.disconnect();
    WiFi.reconnect();
    Serial.println(WiFi.localIP());
    previousMillis = currentMillis;
  }
}
