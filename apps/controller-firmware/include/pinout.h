/**
 * TerraHub Controller Firmware - Pin Assignments
 * 
 * GPIO pin assignments for the ESP32 controller board
 */

#ifndef TERRAHUB_PINOUT_H
#define TERRAHUB_PINOUT_H

#include "config.h"

// ============================================================================
// I2C Bus
// ============================================================================

#define I2C_SDA_PIN 21
#define I2C_SCL_PIN 22

// ============================================================================
// Relay Outputs
// ============================================================================

// Relay control pins (active high by default)
static const int relayPins[NUM_RELAY_CHANNELS] = {
  32,  // Relay 1 (OUT1)
  33,  // Relay 2 (OUT2)
  25,  // Relay 3 (OUT3)
  26,  // Relay 4 (OUT4)
  27   // Relay 5 (OUT5)
};

// ============================================================================
// Current Sensors
// ============================================================================

// Analog input pins for current sensing
static const int currentSensorPins[NUM_CURRENT_SENSORS] = {
  36,  // Current sensor 1 (VP)
  39,  // Current sensor 2 (VN)
  34,  // Current sensor 3
  35,  // Current sensor 4
  32   // Current sensor 5 (shared with relay, use external ADC if needed)
};

// ============================================================================
// Daisy Chain Sync
// ============================================================================

// Upstream presence detection (input)
#define SYNC_IN_PIN 16

// Downstream enable (output)
#define SYNC_OUT_PIN 17

// ============================================================================
// Temperature/Humidity Sensor
// ============================================================================

#define DHT_DATA_PIN 4
#define DHT_TYPE DHT22

// ============================================================================
// Buzzer
// ============================================================================

#define BUZZER_PIN 2

// ============================================================================
// Status LED
// ============================================================================

#define STATUS_LED_PIN 2  // Built-in LED on most ESP32 boards

// ============================================================================
// WS2812 LED Strip
// ============================================================================

#define WS2812_DATA_PIN 5
#define WS2812_NUM_LEDS 30

#endif // TERRAHUB_PINOUT_H
