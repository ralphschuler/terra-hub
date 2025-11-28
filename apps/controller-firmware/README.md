# TerraHub Controller Firmware

ESP32 firmware for the TerraHub controller and slave nodes.

## Overview

This firmware provides:
- I²C communication protocol implementation
- Relay control for 5 output channels
- Current sensing for fault detection
- Sensor reading (temperature, humidity, etc.)
- Web server for configuration and monitoring
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

The firmware can be configured via:
1. Web interface at `http://<device-ip>/`
2. Serial console
3. JSON configuration upload

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
