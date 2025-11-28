/**
 * TerraHub Controller Firmware - Main Entry Point
 * 
 * This is the main entry point for the TerraHub ESP32 firmware.
 * It initializes all subsystems and runs the main loop.
 */

#include <Arduino.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>
#include <algorithm>
#include <cmath>
#include <vector>
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
static const char *provisioningApSsid = "TerraHub-Setup";
static const char *provisioningApPassword = "terra-hub";

struct WifiConfig {
  String ssid;
  String password;
  String hostname;
  bool configured;
};

static WifiConfig wifiConfig{.configured = false};
static bool wifiConnected = false;

// Sensor values that the ESP evaluates locally
struct SensorValues {
  float temperatureC;
  float humidityPercent;
  float lightLevelLux;
};

// Rule condition and actions
struct RuleCondition {
  String sensor;
  String op;           // gt, lt, gte, lte, eq
  float threshold;
  float hysteresis;
};

struct RuleAction {
  uint8_t relayIndex;
  bool turnOn;
  uint32_t minDurationMs;
};

struct RuleDefinition {
  String id;
  String name;
  bool enabled;
  RuleCondition condition;
  RuleAction action;
};

struct ActiveAction {
  String ruleId;
  uint32_t minEndTime;
  RuleAction action;
};

static SensorValues sensorValues{0.0f, 0.0f, 0.0f};
static unsigned long lastSensorPoll = 0;
static Preferences preferences;
static std::vector<RuleDefinition> rules;
static std::vector<ActiveAction> activeActions;

// Web server
WebServer server(WEB_SERVER_PORT);

// Forward declarations
void setupI2C();
void setupRelays();
void setupSensors();
void setupNetwork();
void setupWebServer();
void handleEnumeration();
void handleI2CRequest();
void loop_controller();
void loop_slave();
void pollSensors();
void evaluateRules();
void loadRulesFromStorage();
void saveRulesToStorage();
void loadWifiFromStorage();
void saveWifiToStorage(const WifiConfig &config);
bool connectToConfiguredWifi();
float getSensorField(const String &key, const SensorValues &values);
bool evaluateCondition(const RuleCondition &condition, const SensorValues &values);
void setRelayState(uint8_t index, bool on);

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

    // Hydrate Wi-Fi configuration before bringing up the network interfaces
    loadWifiFromStorage();
    setupNetwork();
    loadRulesFromStorage();
    setupWebServer();
    lastSensorPoll = millis();
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

  // Poll sensors locally to keep the rules engine on the ESP
  if (millis() - lastSensorPoll >= SENSOR_POLL_INTERVAL_MS) {
    pollSensors();
    evaluateRules();
    lastSensorPoll = millis();
  }
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

  server.on("/api/config", HTTP_GET, []() {
    DynamicJsonDocument doc(1024);
    JsonObject root = doc.to<JsonObject>();
    root["apSsid"] = provisioningApSsid;
    root["apPassword"] = provisioningApPassword;
    root["apIp"] = WiFi.softAPIP().toString();
    root["stationIp"] = WiFi.localIP().toString();
    root["stationConnected"] = WiFi.status() == WL_CONNECTED;
    root["wifiConfigured"] = wifiConfig.configured;
    root["stationSsid"] = wifiConfig.ssid;
    root["hostname"] = wifiConfig.hostname;

    String output;
    serializeJson(root, output);
    server.send(200, "application/json", output);
  });

  server.on("/api/config/wifi", HTTP_POST, []() {
    if (!server.hasArg("plain")) {
      server.send(400, "application/json", "{\"error\":\"Missing body\"}");
      return;
    }

    DynamicJsonDocument doc(512);
    auto error = deserializeJson(doc, server.arg("plain"));
    if (error) {
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
      return;
    }

    String ssid = doc["ssid"].as<String>();
    String password = doc["password"].as<String>();
    String hostname = doc["hostname"].as<String>();

    if (ssid.isEmpty() || password.isEmpty()) {
      server.send(400, "application/json", "{\"error\":\"ssid and password required\"}");
      return;
    }

    wifiConfig.ssid = ssid;
    wifiConfig.password = password;
    wifiConfig.hostname = hostname.length() ? hostname : wifiConfig.hostname;
    wifiConfig.configured = true;

    saveWifiToStorage(wifiConfig);
    bool connected = connectToConfiguredWifi();

    DynamicJsonDocument resp(256);
    resp["connected"] = connected;
    resp["ip"] = WiFi.localIP().toString();
    resp["ssid"] = wifiConfig.ssid;
    resp["hostname"] = wifiConfig.hostname;

    String output;
    serializeJson(resp, output);
    server.send(200, "application/json", output);
  });

  server.on("/api/status", HTTP_GET, []() {
    DynamicJsonDocument doc(1024);
    JsonObject root = doc.to<JsonObject>();
    root["version"] = TERRAHUB_VERSION;
    root["role"] = isController ? "controller" : "slave";
    root["nodeId"] = nodeId;
    root["online"] = WiFi.isConnected();
    root["ip"] = WiFi.localIP().toString();

    JsonArray relays = root.createNestedArray("relays");
    for (int i = 0; i < NUM_RELAY_CHANNELS; i++) {
      relays.add(relayStates[i]);
    }

    JsonObject sensors = root.createNestedObject("sensors");
    sensors["temperatureC"] = sensorValues.temperatureC;
    sensors["humidityPercent"] = sensorValues.humidityPercent;
    sensors["lightLevelLux"] = sensorValues.lightLevelLux;

    root["ruleCount"] = rules.size();

    String output;
    serializeJson(root, output);
    server.send(200, "application/json", output);
  });

  server.on("/api/rules", HTTP_GET, []() {
    DynamicJsonDocument doc(3072);
    JsonArray arr = doc.to<JsonArray>();
    for (const auto &rule : rules) {
      JsonObject obj = arr.createNestedObject();
      obj["id"] = rule.id;
      obj["name"] = rule.name;
      obj["enabled"] = rule.enabled;

      JsonObject condition = obj.createNestedObject("condition");
      condition["sensor"] = rule.condition.sensor;
      condition["op"] = rule.condition.op;
      condition["threshold"] = rule.condition.threshold;
      condition["hysteresis"] = rule.condition.hysteresis;

      JsonObject action = obj.createNestedObject("action");
      action["relayIndex"] = rule.action.relayIndex;
      action["turnOn"] = rule.action.turnOn;
      action["minDurationMs"] = rule.action.minDurationMs;
    }

    String output;
    serializeJson(doc, output);
    server.send(200, "application/json", output);
  });

  server.on("/api/rules", HTTP_POST, []() {
    if (!server.hasArg("plain")) {
      server.send(400, "application/json", "{\"error\":\"Missing body\"}");
      return;
    }

    DynamicJsonDocument doc(4096);
    auto error = deserializeJson(doc, server.arg("plain"));
    if (error) {
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
      return;
    }

    std::vector<RuleDefinition> nextRules;
    for (JsonObject obj : doc.as<JsonArray>()) {
      RuleDefinition rule;
      rule.id = obj["id"].as<String>();
      rule.name = obj["name"].as<String>();
      rule.enabled = obj["enabled"] | true;

      JsonObject cond = obj["condition"].as<JsonObject>();
      rule.condition.sensor = cond["sensor"].as<String>();
      rule.condition.op = cond["op"].as<String>();
      rule.condition.threshold = cond["threshold"] | 0;
      rule.condition.hysteresis = cond["hysteresis"] | 0;

      JsonObject action = obj["action"].as<JsonObject>();
      rule.action.relayIndex = action["relayIndex"] | 0;
      rule.action.turnOn = action["turnOn"] | false;
      rule.action.minDurationMs = action["minDurationMs"] | 0;
      nextRules.push_back(rule);
    }

    rules = nextRules;
    saveRulesToStorage();
    server.send(204);
  });

  server.on("/api/relays", HTTP_POST, []() {
    if (!server.hasArg("plain")) {
      server.send(400, "application/json", "{\"error\":\"Missing body\"}");
      return;
    }

    DynamicJsonDocument doc(512);
    auto error = deserializeJson(doc, server.arg("plain"));
    if (error) {
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
      return;
    }

    uint8_t index = doc["relayIndex"] | 0;
    bool on = doc["turnOn"] | false;
    setRelayState(index, on);

    DynamicJsonDocument resp(256);
    resp["relayIndex"] = index;
    resp["turnOn"] = on;
    String output;
    serializeJson(resp, output);
    server.send(200, "application/json", output);
  });

  // Allows the UI to feed sensor values when hardware sensors are absent
  server.on("/api/sensors/mock", HTTP_POST, []() {
    if (!server.hasArg("plain")) {
      server.send(400, "application/json", "{\"error\":\"Missing body\"}");
      return;
    }

    DynamicJsonDocument doc(512);
    auto error = deserializeJson(doc, server.arg("plain"));
    if (error) {
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
      return;
    }

    sensorValues.temperatureC = doc["temperatureC"] | sensorValues.temperatureC;
    sensorValues.humidityPercent = doc["humidityPercent"] | sensorValues.humidityPercent;
    sensorValues.lightLevelLux = doc["lightLevelLux"] | sensorValues.lightLevelLux;

    server.send(204);
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

void setupNetwork() {
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(provisioningApSsid, provisioningApPassword);

  Serial.print("Provisioning AP SSID: ");
  Serial.println(provisioningApSsid);
  Serial.print("AP IP: ");
  Serial.println(WiFi.softAPIP());

  wifiConnected = connectToConfiguredWifi();
  if (wifiConnected) {
    Serial.print("Station mode active. IP: ");
    Serial.println(WiFi.localIP());
  }
}

void pollSensors() {
  // TODO: Replace with real sensor reads. For now we keep the last values
  // and allow the UI to push overrides via /api/sensors/mock.
  Serial.printf("Polling sensors: T=%.2fC H=%.2f%% L=%.2flux\n", sensorValues.temperatureC,
                sensorValues.humidityPercent, sensorValues.lightLevelLux);
}

float getSensorField(const String &key, const SensorValues &values) {
  if (key == "temperatureC") {
    return values.temperatureC;
  }
  if (key == "humidityPercent") {
    return values.humidityPercent;
  }
  if (key == "lightLevelLux") {
    return values.lightLevelLux;
  }
  return NAN;
}

bool evaluateCondition(const RuleCondition &condition, const SensorValues &values) {
  float value = getSensorField(condition.sensor, values);
  if (isnan(value)) {
    return false;
  }

  float target = condition.threshold;
  if (condition.op == "gt") return value > target;
  if (condition.op == "lt") return value < target;
  if (condition.op == "gte") return value >= target;
  if (condition.op == "lte") return value <= target;
  if (condition.op == "eq") return fabs(value - target) <= condition.hysteresis;
  return false;
}

void setRelayState(uint8_t index, bool on) {
  if (index >= NUM_RELAY_CHANNELS) {
    return;
  }
  digitalWrite(relayPins[index], on ? RELAY_ON_STATE : RELAY_OFF_STATE);
  relayStates[index] = on;
}

void evaluateRules() {
  const uint32_t now = millis();

  // Clear expired actions
  for (auto it = activeActions.begin(); it != activeActions.end();) {
    if (now >= it->minEndTime) {
      it = activeActions.erase(it);
    } else {
      ++it;
    }
  }

  for (const auto &rule : rules) {
    if (!rule.enabled) continue;

    bool conditionMet = evaluateCondition(rule.condition, sensorValues);
    auto existing = std::find_if(activeActions.begin(), activeActions.end(), [&](const ActiveAction &a) {
      return a.ruleId == rule.id;
    });

    if (conditionMet) {
      if (existing == activeActions.end()) {
        ActiveAction active{rule.id, now + rule.action.minDurationMs, rule.action};
        activeActions.push_back(active);
      }
      setRelayState(rule.action.relayIndex, rule.action.turnOn);
    } else if (existing != activeActions.end()) {
      // Condition cleared, but respect minimum duration
      if (now >= existing->minEndTime) {
        setRelayState(rule.action.relayIndex, !rule.action.turnOn);
        activeActions.erase(existing);
      }
    }
  }
}

void loadRulesFromStorage() {
  rules.clear();
  preferences.begin("terrahub", true);
  String raw = preferences.getString("rules", "");
  preferences.end();
  if (raw.isEmpty()) {
    return;
  }

  DynamicJsonDocument doc(4096);
  if (deserializeJson(doc, raw)) {
    Serial.println("Failed to parse stored rules");
    return;
  }

  for (JsonObject obj : doc.as<JsonArray>()) {
    RuleDefinition rule;
    rule.id = obj["id"].as<String>();
    rule.name = obj["name"].as<String>();
    rule.enabled = obj["enabled"] | true;

    JsonObject cond = obj["condition"].as<JsonObject>();
    rule.condition.sensor = cond["sensor"].as<String>();
    rule.condition.op = cond["op"].as<String>();
    rule.condition.threshold = cond["threshold"] | 0;
    rule.condition.hysteresis = cond["hysteresis"] | 0;

    JsonObject action = obj["action"].as<JsonObject>();
    rule.action.relayIndex = action["relayIndex"] | 0;
    rule.action.turnOn = action["turnOn"] | false;
    rule.action.minDurationMs = action["minDurationMs"] | 0;
    rules.push_back(rule);
  }
}

void saveRulesToStorage() {
  DynamicJsonDocument doc(4096);
  JsonArray arr = doc.to<JsonArray>();
  for (const auto &rule : rules) {
    JsonObject obj = arr.createNestedObject();
    obj["id"] = rule.id;
    obj["name"] = rule.name;
    obj["enabled"] = rule.enabled;

    JsonObject cond = obj.createNestedObject("condition");
    cond["sensor"] = rule.condition.sensor;
    cond["op"] = rule.condition.op;
    cond["threshold"] = rule.condition.threshold;
    cond["hysteresis"] = rule.condition.hysteresis;

    JsonObject action = obj.createNestedObject("action");
    action["relayIndex"] = rule.action.relayIndex;
    action["turnOn"] = rule.action.turnOn;
    action["minDurationMs"] = rule.action.minDurationMs;
  }

  String output;
  serializeJson(doc, output);

  preferences.begin("terrahub", false);
  preferences.putString("rules", output);
  preferences.end();
}

void loadWifiFromStorage() {
  preferences.begin("terrahub", true);
  wifiConfig.ssid = preferences.getString("wifi_ssid", "");
  wifiConfig.password = preferences.getString("wifi_pass", "");
  wifiConfig.hostname = preferences.getString("wifi_hostname", "terrahub");
  preferences.end();

  wifiConfig.configured = wifiConfig.ssid.length() > 0;
}

void saveWifiToStorage(const WifiConfig &config) {
  preferences.begin("terrahub", false);
  preferences.putString("wifi_ssid", config.ssid);
  preferences.putString("wifi_pass", config.password);
  preferences.putString("wifi_hostname", config.hostname.length() ? config.hostname : "terrahub");
  preferences.end();
}

bool connectToConfiguredWifi() {
  if (!wifiConfig.configured) {
    wifiConnected = false;
    return false;
  }

  if (wifiConfig.hostname.length()) {
    WiFi.setHostname(wifiConfig.hostname.c_str());
  }

  WiFi.begin(wifiConfig.ssid.c_str(), wifiConfig.password.c_str());
  Serial.print("Connecting to Wi-Fi SSID: ");
  Serial.println(wifiConfig.ssid);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < 15000) {
    delay(200);
    Serial.print(".");
  }

  wifiConnected = WiFi.status() == WL_CONNECTED;
  Serial.println();
  if (wifiConnected) {
    Serial.print("Wi-Fi connected. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Wi-Fi connection timed out; staying in AP mode for setup.");
  }

  return wifiConnected;
}
