#include <ArduinoWebsockets.h>
#include <WiFi.h>

const char* ssid            = "ssid15";
const char* password        = "oic15oic15";
const IPAddress ip(192,168,2,97);
const IPAddress subnet(255,255,255,0);

//void collectHeaders()

const char* websockets_connection_string = "ws://192.168.2.98:3000/"; //Enter server adress

#define LED_SWITCH      26
//#define LED_SWITCH_lock 27
#define Check_LED       17

using namespace websockets;

WebsocketsClient client;

void onMessageCallback(WebsocketsMessage message) {
    Serial.print("Got Message: ");
    Serial.println(message.data());

    String myString = String(message.data());

    if(myString == "message:on"){
      Serial.println("unlock");
      digitalWrite(LED_SWITCH, HIGH);
      delay(150);
      digitalWrite(LED_SWITCH, LOW);
      client.send("esp32:unlock");
    }
//    else if(myString == "message:off"){
//      digitalWrite(LED_SWITCH_lock, HIGH);
//      delay(150);
//      digitalWrite(LED_SWITCH_lock, LOW);
//    }
    else if(myString == "message:state-check"){
      client.send("esp32ok");
    }
    else{
      digitalWrite(LED_SWITCH, LOW);
      digitalWrite(LED_SWITCH_lock, LOW);
      Serial.println("LOW now");
    }
}

void onEventsCallback(WebsocketsEvent event, String data) {
    if(event == WebsocketsEvent::ConnectionOpened) {
        Serial.println("Connnection Opened");
    } else if(event == WebsocketsEvent::ConnectionClosed) {
        Serial.println("Connnection Closed");
        ESP.restart();
    } else if(event == WebsocketsEvent::GotPing) {
        Serial.println("Got a Ping!");
    } else if(event == WebsocketsEvent::GotPong) {
        Serial.println("Got a Pong!");
    }
}

void setup() {
    Serial.begin(115200);
    pinMode(LED_SWITCH, OUTPUT);
//    pinMode(LED_SWITCH_lock, OUTPUT);
    pinMode(Check_LED,  OUTPUT);
    digitalWrite(Check_LED, HIGH);
    delay(100);
    digitalWrite(Check_LED, LOW);

    if (!WiFi.config(ip,ip,subnet)){
     Serial.println("Failed to configure!");
    }

    // Connect to Wi-Fi
    int count=0;
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
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

    // Connect to server
    bool connected = client.connect(websockets_connection_string);
    if(connected) {
        Serial.println("Connected!");
        client.send("Hello Server");
   } else {
        Serial.println("Not Connected!");
        delay(5000);
        digitalWrite(Check_LED, HIGH);
        delay(100);
        digitalWrite(Check_LED, LOW);
        ESP.restart();
    }

    // Send a ping
    client.ping();

    // run callback when messages are received
    client.onMessage(onMessageCallback);

    // run callback when events are occuring
    client.onEvent(onEventsCallback);

}

void loop() {
    client.poll();
    delay(100);
}
