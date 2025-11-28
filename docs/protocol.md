# TerraHub I²C Protocol Specification

**Version:** 1.0  
**Status:** Draft

This document specifies the I²C communication protocol used between TerraHub nodes.

## Overview

TerraHub uses a custom I²C protocol for node enumeration and inter-node communication. The protocol is designed to be:

- Simple and easy to implement on embedded systems
- Reliable with clear message framing
- Extensible for future features

## Physical Layer

- **Bus Speed:** 100 kHz (Standard Mode) or 400 kHz (Fast Mode)
- **Pull-up Resistors:** 4.7kΩ recommended
- **Max Bus Length:** Depends on node count and cable quality (typically <1m between nodes)

## Addressing Scheme

| Address Range | Usage |
|---------------|-------|
| 0x30 | Default address for unassigned slaves |
| 0x31 - 0x3F | Assigned slave addresses (0x30 + nodeId) |
| 0x50 - 0x57 | Reserved for EEPROM |
| 0x68 | Reserved for RTC |

## Message Format

All messages follow this structure:

```
┌──────────┬──────────┬───────────────┬──────────┐
│ Command  │ Length   │ Payload       │ Checksum │
│ (1 byte) │ (1 byte) │ (0-254 bytes) │ (1 byte) │
└──────────┴──────────┴───────────────┴──────────┘
```

- **Command:** Operation code
- **Length:** Number of payload bytes (0-254)
- **Payload:** Command-specific data
- **Checksum:** XOR of all preceding bytes

## Commands

### Enumeration Commands (Default Address 0x30)

These commands are used during the auto-enumeration process.

#### 0x01 - HELLO_UNASSIGNED

Check if an unassigned slave is present.

**Request:**
```
Command: 0x01
Length:  0x00
Payload: (none)
```

**Response:**
```
Status:  0x00 (OK)
Length:  0x02
Payload: [fw_major, fw_minor]
```

#### 0x02 - ASSIGN_ID

Assign a node ID to an unassigned slave.

**Request:**
```
Command: 0x02
Length:  0x01
Payload: [node_id]
```

**Response:**
```
Status:  0x00 (OK)
Length:  0x01
Payload: [assigned_id]
```

After receiving this command, the slave:
1. Stores the node ID in EEPROM
2. Switches to its new I²C address (0x30 + node_id)
3. Responds with acknowledgment

#### 0x03 - ENABLE_DOWNSTREAM

Enable the SYNC_OUT signal to allow the next node to power up.

**Request:**
```
Command: 0x03
Length:  0x00
Payload: (none)
```

**Response:**
```
Status:  0x00 (OK)
Length:  0x00
```

### Regular Commands (Assigned Address 0x31+)

These commands work with nodes that have been assigned an ID.

#### 0x10 - PING

Check if a node is responsive.

**Request:**
```
Command: 0x10
Length:  0x00
Payload: (none)
```

**Response:**
```
Status:  0x00 (OK)
Length:  0x01
Payload: [node_id]
```

#### 0x11 - GET_NODE_INFO

Get information about the node.

**Request:**
```
Command: 0x11
Length:  0x00
Payload: (none)
```

**Response:**
```
Status:  0x00 (OK)
Length:  0x0A
Payload: [
  node_id,
  fw_major, fw_minor, fw_patch,
  hw_revision,
  port_count,
  sensor_count,
  flags_low, flags_high,
  uptime_hours
]
```

#### 0x12 - GET_PORTS

Get port configuration.

**Request:**
```
Command: 0x12
Length:  0x00
Payload: (none)
```

**Response:**
```
Status:  0x00 (OK)
Length:  variable
Payload: [
  port_count,
  For each port:
    port_id,
    port_type,
    port_flags
]
```

**Port Types:**
| Value | Type |
|-------|------|
| 0x00 | Unused |
| 0x01 | Light |
| 0x02 | Heater |
| 0x03 | Pump |
| 0x04 | Mister |
| 0x05 | Atomizer |
| 0x06 | Fan |
| 0xFF | Other |

#### 0x13 - GET_PORT_STATE

Get the current state of a specific port.

**Request:**
```
Command: 0x13
Length:  0x01
Payload: [port_id]
```

**Response:**
```
Status:  0x00 (OK)
Length:  0x04
Payload: [
  port_id,
  state,           # 0=OFF, 1=ON
  current_ma_low,
  current_ma_high
]
```

#### 0x14 - SET_PORT_STATE

Set the state of a specific port.

**Request:**
```
Command: 0x14
Length:  0x02
Payload: [port_id, state]
```

**Response:**
```
Status:  0x00 (OK)
Length:  0x02
Payload: [port_id, new_state]
```

#### 0x20 - GET_SENSOR_VALUES

Get all sensor readings.

**Request:**
```
Command: 0x20
Length:  0x00
Payload: (none)
```

**Response:**
```
Status:  0x00 (OK)
Length:  variable
Payload: [
  sensor_count,
  For each sensor:
    sensor_type,
    value_low, value_high,
    unit
]
```

**Sensor Types:**
| Value | Type | Unit |
|-------|------|------|
| 0x01 | Temperature | 0.1°C |
| 0x02 | Humidity | 0.1% RH |
| 0x03 | Light Level | Lux |
| 0x04 | Pressure | hPa |

#### 0x30 - SET_CONFIG_CHUNK

Write a chunk of configuration data.

**Request:**
```
Command: 0x30
Length:  variable
Payload: [
  chunk_offset_low,
  chunk_offset_high,
  chunk_data...
]
```

**Response:**
```
Status:  0x00 (OK)
Length:  0x02
Payload: [bytes_written_low, bytes_written_high]
```

#### 0x31 - GET_CONFIG_HASH

Get a hash of the current configuration for sync verification.

**Request:**
```
Command: 0x31
Length:  0x00
Payload: (none)
```

**Response:**
```
Status:  0x00 (OK)
Length:  0x04
Payload: [hash_byte_0, hash_byte_1, hash_byte_2, hash_byte_3]
```

## Status Codes

| Code | Meaning |
|------|---------|
| 0x00 | OK |
| 0x01 | Unknown Command |
| 0x02 | Invalid Parameters |
| 0x03 | Busy |
| 0x04 | Hardware Error |
| 0xFF | General Error |

## Error Handling

1. **No Response:** If a slave doesn't respond within 50ms, retry up to 3 times
2. **Checksum Error:** Discard message and request retransmission
3. **NACK:** Bus error, reset and retry

## Timing

| Parameter | Value |
|-----------|-------|
| Command Timeout | 50ms |
| Retry Count | 3 |
| Retry Delay | 10ms |
| Enumeration Delay | 100ms between nodes |

## Protocol Versioning

The protocol version is indicated in the GET_NODE_INFO response. Major version changes indicate breaking changes; minor versions are backward compatible.

## Example: Enumeration Sequence

```
Controller                  Slave (Node 2)
    │                            │
    │ [0x30] HELLO_UNASSIGNED    │
    │───────────────────────────►│
    │                            │
    │            OK [1, 0]       │
    │◄───────────────────────────│
    │                            │
    │ [0x30] ASSIGN_ID [2]       │
    │───────────────────────────►│
    │                            │
    │            OK [2]          │
    │◄───────────────────────────│
    │                            │
    │ [0x31] PING                │
    │───────────────────────────►│
    │         (new address)      │
    │            OK [2]          │
    │◄───────────────────────────│
    │                            │
    │ [0x31] ENABLE_DOWNSTREAM   │
    │───────────────────────────►│
    │                            │
    │            OK              │
    │◄───────────────────────────│
```

## See Also

- [Architecture Overview](./architecture-overview.md)
- [Getting Started](./getting-started.md)
