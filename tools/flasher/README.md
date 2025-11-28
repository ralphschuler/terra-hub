# TerraHub Flasher

Flash and provisioning CLI tool for TerraHub devices.

## Overview

The flasher tool provides a command-line interface for:
- Flashing firmware to TerraHub ESP32 devices
- Setting initial WiFi configuration
- Provisioning device identity
- Factory reset

## Prerequisites

- Python 3.8+ or Node.js 18+
- USB serial driver for your ESP32 board
- esptool.py (installed automatically)

## Installation

```bash
# Install dependencies
pnpm install

# Or install globally
pnpm install -g @terra-hub/flasher
```

## Usage

### Flash Firmware

```bash
# Flash the latest firmware
terrahub-flash flash

# Flash a specific firmware file
terrahub-flash flash --firmware ./firmware.bin

# Flash with specific serial port
terrahub-flash flash --port /dev/ttyUSB0
```

### Configure WiFi

```bash
# Set WiFi credentials
terrahub-flash wifi --ssid "MyNetwork" --password "MyPassword"
```

### Factory Reset

```bash
# Reset device to factory defaults
terrahub-flash reset
```

### Device Info

```bash
# Show device information
terrahub-flash info
```

## Options

| Option | Description |
|--------|-------------|
| `--port` | Serial port (auto-detected if not specified) |
| `--baud` | Baud rate (default: 921600) |
| `--firmware` | Path to firmware binary |
| `--ssid` | WiFi network name |
| `--password` | WiFi password |

## License

MIT License - see [LICENSE](../../LICENSE) for details.
