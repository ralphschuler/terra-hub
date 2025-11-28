# TerraHub Controller Firmware

ESP32 firmware for the TerraHub controller and slave nodes.

## Overview

This firmware provides:
- I²C communication protocol implementation
- Relay control for 5 output channels
- Current sensing for fault detection
- Sensor reading (temperature, humidity, etc.)
- Web server that hosts **all automation logic** (rules engine, trigger evaluation, relay actions)
- Auto-enumeration support for Daisy-Chain topology

## Hardware Requirements

- ESP32 development board (ESP32-WROOM-32 recommended)
- 5-channel relay module
- Hall-effect current sensors (one per channel)
- Temperature/humidity sensor (DHT22 or similar)
- Power supply (5V, 10A recommended for full chain)

## Pin Configuration

See `include/pinout.h` for the default pin assignments.

## Building

This project uses PlatformIO. To build:

```bash
# Install PlatformIO CLI (if not already installed)
pip install platformio

# Build the firmware
pio run

# Upload to connected ESP32
pio run --target upload

# Monitor serial output
pio device monitor
```

## Configuration

All scheduling, rules, and relay triggers now run directly on the ESP32 web server so the web panel is just a UI. The firmware exposes a JSON API that the UI can call:

- `GET /api/status` — device role, IP, relay states, and the latest sensor readings being evaluated locally
- `GET /api/rules` — current rules stored on the ESP (persisted in NVS)
- `POST /api/rules` — replace the full rule set; body is an array of `{ id, name, enabled, condition { sensor, op, threshold, hysteresis }, action { relayIndex, turnOn, minDurationMs } }`
- `POST /api/relays` — immediately set a relay `{ relayIndex, turnOn }`
- `POST /api/sensors/mock` — optional helper for tests/UIs to push sensor readings when physical sensors are absent
- `GET /api/config` — SoftAP name/IP plus current station configuration
- `POST /api/config/wifi` — save `{ ssid, password, hostname? }` and request a reconnect

On first boot the controller broadcasts a setup SoftAP (`TerraHub-Setup` / password `terra-hub`) so the web UI can reach the API without an external router. After Wi-Fi credentials are saved, the ESP32 will join your LAN while keeping the setup AP available for recovery. TypeScript cannot run on the ESP32 directly, so the automation logic is implemented in C++ using Arduino primitives and ArduinoJson while keeping all evaluation on the device.

## Directory Structure

```
controller-firmware/
├─ include/           # Header files
│  ├─ pinout.h       # Pin assignments
│  ├─ config.h       # Compile-time configuration
│  └─ ...
├─ lib/              # Project-specific libraries
├─ src/              # Source files
│  └─ main.cpp       # Main entry point
├─ test/             # Unit tests
└─ platformio.ini    # PlatformIO configuration
```

## I²C Protocol

See [Protocol Documentation](../../docs/protocol.md) for the I²C protocol specification.

## License

MIT License - see [LICENSE](../../LICENSE) for details.
