/**
 * TerraHub Controller Firmware - Configuration
 * 
 * Compile-time configuration options
 */

#ifndef TERRAHUB_CONFIG_H
#define TERRAHUB_CONFIG_H

// Number of relay output channels
#define NUM_RELAY_CHANNELS 5

// Number of current sensing channels
#define NUM_CURRENT_SENSORS 5

// Default I2C address for unassigned slaves
#define I2C_DEFAULT_ADDRESS 0x30

// I2C address base for assigned slaves (address = base + nodeId)
#define I2C_ADDRESS_BASE 0x30

// Maximum number of nodes in a chain
#define MAX_NODES 16

// Relay states (active high or active low depending on relay module)
#define RELAY_ON_STATE HIGH
#define RELAY_OFF_STATE LOW

// Current threshold for fault detection (in mA)
#define CURRENT_FAULT_THRESHOLD_MA 50

// Buzzer settings
#define BUZZER_BEEP_DURATION_MS 500
#define BUZZER_PAUSE_DURATION_MS 500
#define BUZZER_LONG_PAUSE_MS 3000

// Sensor polling interval (in milliseconds)
#define SENSOR_POLL_INTERVAL_MS 1000

// Web server port
#define WEB_SERVER_PORT 80

// NTP server
#define NTP_SERVER "pool.ntp.org"

// WiFi connection timeout (in seconds)
#define WIFI_CONNECT_TIMEOUT_SEC 30

#endif // TERRAHUB_CONFIG_H
