# TerraHub Architecture Overview

This document provides a high-level overview of the TerraHub system architecture.

## System Overview

TerraHub is designed as a distributed system where multiple identical hardware nodes can work together to control and monitor terrarium equipment. The architecture emphasizes:

- **Modularity** - Each component is self-contained and can be developed/tested independently
- **Scalability** - Additional nodes can be added via Daisy-Chain topology
- **Reliability** - Current monitoring provides fault detection for connected devices
- **Simplicity** - No cloud dependency, all processing happens locally

## Hardware Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     TerraHub Node                           │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   AC Zone   │  │   DC Zone   │  │   Control Logic     │  │
│  │ (230V)      │  │ (5V)        │  │                     │  │
│  │             │  │             │  │   ESP32             │  │
│  │ IEC C14     │  │ 5V PSU      │  │   ├─ I²C Bus        │  │
│  │ Main Switch │  │ (10A)       │  │   ├─ GPIO (Relays)  │  │
│  │ Fuse        │  │             │  │   ├─ ADC (Sensors)  │  │
│  │ 5x Relays   │  │ LED Strip   │  │   └─ WiFi/BLE       │  │
│  │ 5x Current  │  │ Display     │  │                     │  │
│  │   Sensors   │  │ Sensors     │  └─────────────────────┘  │
│  └─────────────┘  └─────────────┘                           │
│                                                             │
│  SYNC_IN ◄────────────────────────────────────► SYNC_OUT    │
└─────────────────────────────────────────────────────────────┘
```

## Daisy-Chain Topology

Multiple nodes connect in a chain:

```
   Controller (Node 1)     Slave (Node 2)        Slave (Node 3)
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  SYNC_IN   SYNC_OUT  │  │  SYNC_IN   SYNC_OUT  │  │  SYNC_IN   SYNC_OUT  │
│   (NC)       ●───────┼──┼───►●         ●───────┼──┼───►●         (NC)    │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
                │                  │                         │
                └──────────────────┴─────────────────────────┘
                              Shared I²C Bus
```

### Auto-Enumeration Process

1. Node with no SYNC_IN signal becomes Controller (nodeId = 1)
2. Controller scans for unassigned slaves at default address (0x30)
3. Controller sends `ASSIGN_ID` to each slave sequentially
4. Slave enables SYNC_OUT after receiving its ID
5. Process repeats until no more unassigned slaves respond

## Software Architecture

### Firmware (ESP32)

```
┌───────────────────────────────────────────────────┐
│                 Application Layer                  │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Scheduler  │  │ Rules       │  │ Web        │ │
│  │             │  │ Engine      │  │ Server     │ │
│  └─────────────┘  └─────────────┘  └────────────┘ │
├───────────────────────────────────────────────────┤
│                  HAL (Hardware Abstraction)        │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Relay      │  │ Sensor      │  │ I²C        │ │
│  │  Driver     │  │ Driver      │  │ Protocol   │ │
│  └─────────────┘  └─────────────┘  └────────────┘ │
├───────────────────────────────────────────────────┤
│               ESP-IDF / Arduino Core               │
└───────────────────────────────────────────────────┘
```

### Web Panel

```
┌───────────────────────────────────────────────────┐
│                   Vue/React App                    │
│  ┌─────────────────────────────────────────────┐  │
│  │  Components                                  │  │
│  │  ├─ Dashboard (Live State)                  │  │
│  │  ├─ Port Configuration                      │  │
│  │  ├─ Schedule Editor                         │  │
│  │  ├─ Rules Editor                            │  │
│  │  └─ Settings (Network/Backup)               │  │
│  └─────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐  │
│  │  State Management (Pinia/Redux)             │  │
│  └─────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐  │
│  │  API Client (HTTP/WebSocket)                │  │
│  └─────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────┘
```

### Shared Packages

- **protocol** - I²C message definitions and TypeScript client
- **rules-engine** - Condition evaluation and action triggering
- **config-schema** - JSON schemas for configuration validation

## Data Flow

### Sensor → Rules → Action

```
Sensor Reading     Rules Engine        Relay Action
     │                  │                   │
     ▼                  ▼                   ▼
┌─────────┐      ┌──────────────┐     ┌─────────┐
│ DHT22   │──►───│ Humidity<25% │──►──│ OUT[3]  │
│ Temp/Hum│      │ → ON Mister  │     │ = ON    │
└─────────┘      └──────────────┘     └─────────┘
```

### Configuration Sync

```
Web Panel              Controller              Slaves
    │                      │                      │
    │   Save Config        │                      │
    │─────────────────────►│                      │
    │                      │   Broadcast Config   │
    │                      │─────────────────────►│
    │                      │                      │
    │   Confirm            │◄─────────────────────│
    │◄─────────────────────│                      │
```

## Key Design Decisions

1. **Position-Based IDs** - Node IDs reflect physical chain position, not manual configuration
2. **Port-Based Events** - Events reference port IDs (1:OUT3) not physical pins
3. **JSON Configuration** - All config is JSON for easy backup/restore
4. **Protocol Versioning** - Protocol changes are versioned (v1, v2, etc.)
5. **No Cloud Required** - System works fully offline with optional NTP

## See Also

- [Protocol Specification](./protocol.md)
- [Getting Started](./getting-started.md)
