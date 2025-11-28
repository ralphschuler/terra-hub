# TerraHub Config CLI

WiFi/USB configuration upload tool for TerraHub devices.

## Overview

The config CLI provides a command-line interface for:
- Uploading configuration to TerraHub devices via WiFi or USB
- Downloading current configuration
- Validating configuration files
- Migrating configurations between versions

## Installation

```bash
# Install dependencies
pnpm install

# Or install globally
pnpm install -g @terra-hub/config-cli
```

## Usage

### Upload Configuration

```bash
# Upload configuration via WiFi
terrahub-config upload --file config.json --host 192.168.1.100

# Upload via USB serial
terrahub-config upload --file config.json --port /dev/ttyUSB0
```

### Download Configuration

```bash
# Download current configuration
terrahub-config download --host 192.168.1.100 --output config.json
```

### Validate Configuration

```bash
# Validate a configuration file
terrahub-config validate --file config.json
```

### Migrate Configuration

```bash
# Migrate configuration to new version
terrahub-config migrate --file old-config.json --output new-config.json
```

## Configuration Format

Configuration files use JSON format. See the example below:

```json
{
  "version": "1.0",
  "nodes": [...],
  "rules": [...],
  "schedules": [...],
  "settings": {...}
}
```

For the complete schema, see [@terra-hub/config-schema](../../packages/config-schema/README.md).

## Options

| Option | Description |
|--------|-------------|
| `--file`, `-f` | Configuration file path |
| `--host`, `-h` | Device IP address (for WiFi) |
| `--port`, `-p` | Serial port (for USB) |
| `--output`, `-o` | Output file path |

## License

MIT License - see [LICENSE](../../LICENSE) for details.
