/**
 * TerraHub Controller Firmware - Main Entry Point
 * 
 * This is the main entry point for the TerraHub ESP32 firmware.
 * It initializes all subsystems and runs the main loop.
 */

#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>
#include "config.h"
#include "pinout.h"

// Version info
#ifndef TERRAHUB_VERSION
#define TERRAHUB_VERSION "0.1.0"
#endif

// Global state
static uint8_t nodeId = 0;  // 0 = unassigned, 1 = controller, 2+ = slave
static bool isController = false;
static bool relayStates[NUM_RELAY_CHANNELS] = {false};

// Web server
WebServer server(80);

// Forward declarations
void setupI2C();
void setupRelays();
void setupSensors();
void setupWebServer();
void handleEnumeration();
void handleI2CRequest();
void loop_controller();
void loop_slave();

/**
 * Arduino setup function
 */
void setup() {
  // Initialize serial for debugging
  Serial.begin(115200);
  delay(1000);
  
  Serial.println();
  Serial.println("================================");
  Serial.println("TerraHub Controller Firmware");
  Serial.print("Version: ");
  Serial.println(TERRAHUB_VERSION);
  Serial.println("================================");
  Serial.println();

  // Initialize subsystems
  setupRelays();
  setupSensors();
  setupI2C();
  
  // Determine if we are the controller
  // Controller has no upstream connection on SYNC_IN
  pinMode(SYNC_IN_PIN, INPUT_PULLUP);
  delay(100);
  
  if (digitalRead(SYNC_IN_PIN) == HIGH) {
    // No upstream connection - we are the controller
    isController = true;
    nodeId = 1;
    Serial.println("Role: CONTROLLER (Node ID: 1)");
    
    // Enable downstream
    pinMode(SYNC_OUT_PIN, OUTPUT);
    digitalWrite(SYNC_OUT_PIN, HIGH);
    
    // Start enumeration process
    handleEnumeration();
    
    // TODO(#1): Implement WiFi configuration loading from EEPROM/SPIFFS
    // TODO(#1): Start web server after WiFi connection established
    // setupWebServer();
  } else {
    // Upstream connection detected - we are a slave
    isController = false;
    nodeId = 0;  // Will be assigned during enumeration
    Serial.println("Role: SLAVE (awaiting ID assignment)");
  }
  
  Serial.println("Setup complete!");
}

/**
 * Arduino main loop
 */
void loop() {
  if (isController) {
    loop_controller();
  } else {
    loop_slave();
  }
  
  delay(10);  // Small delay to prevent watchdog issues
}

/**
 * Controller main loop
 */
void loop_controller() {
  // Handle web server requests
  server.handleClient();
  
  // Poll sensors
  // TODO: Implement sensor polling
  
  // Evaluate rules
  // TODO: Implement rules engine
  
  // Check schedules
  // TODO: Implement schedule checking
  
  // Communicate with slaves
  // TODO: Implement slave communication
}

/**
 * Slave main loop
 */
void loop_slave() {
  // Handle I2C requests
  // (handled by interrupt in Wire library)
  
  // Local sensor polling
  // TODO: Implement sensor polling
}

/**
 * Initialize I2C bus
 */
void setupI2C() {
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  
  if (!isController) {
    // Slave mode - listen on default address
    Wire.onReceive([](int numBytes) {
      // Handle received command
      // TODO: Implement command handling
    });
    Wire.onRequest([]() {
      // Handle request for data
      // TODO: Implement request handling
    });
  }
  
  Serial.println("I2C initialized");
}

/**
 * Initialize relay outputs
 */
void setupRelays() {
  for (int i = 0; i < NUM_RELAY_CHANNELS; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], RELAY_OFF_STATE);
    relayStates[i] = false;
  }
  Serial.println("Relays initialized");
}

/**
 * Initialize sensors
 */
void setupSensors() {
  // TODO: Initialize temperature/humidity sensors
  // TODO: Initialize current sensors
  Serial.println("Sensors initialized");
}

/**
 * Setup web server routes
 */
void setupWebServer() {
  server.on("/", HTTP_GET, []() {
    server.send(200, "text/html", 
      "<html><head><title>TerraHub</title></head>"
      "<body><h1>TerraHub Controller</h1>"
      "<p>Version: " TERRAHUB_VERSION "</p>"
      "</body></html>");
  });
  
  server.on("/api/status", HTTP_GET, []() {
    // TODO: Return JSON status
    server.send(200, "application/json", "{\"status\":\"ok\"}");
  });
  
  server.begin();
  Serial.println("Web server started");
}

/**
 * Handle node enumeration (controller only)
 */
void handleEnumeration() {
  Serial.println("Starting node enumeration...");
  
  // TODO: Implement enumeration protocol
  // 1. Scan for unassigned slaves at default address
  // 2. Assign IDs to each slave
  // 3. Enable downstream on each slave
  // 4. Repeat until no more slaves found
  
  Serial.println("Enumeration complete");
}
