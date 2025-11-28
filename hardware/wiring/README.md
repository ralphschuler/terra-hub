# TerraHub Wiring Diagrams

Wiring diagrams and electronics block diagrams for TerraHub.

## Overview

This directory contains wiring documentation:
- System block diagrams
- Internal wiring diagrams
- External connection diagrams
- Cable specifications

## Diagrams

```
wiring/
├─ system-overview.svg      # High-level system diagram
├─ internal-wiring.svg      # Internal component wiring
├─ daisy-chain.svg         # Daisy-chain connection diagram
├─ sensor-hub.svg          # Sensor connection diagram
└─ power-distribution.svg  # Power wiring diagram
```

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     TerraHub Node                           │
│                                                             │
│   ┌─────────────────┐           ┌─────────────────────┐    │
│   │   AC Section    │           │    DC Section       │    │
│   │                 │           │                     │    │
│   │  230V Input ────┼───────────┼─── 5V PSU          │    │
│   │       │         │           │       │             │    │
│   │   ┌───┴───┐     │           │   ┌───┴───┐        │    │
│   │   │ Fuse  │     │           │   │ ESP32 │        │    │
│   │   └───┬───┘     │           │   └───────┘        │    │
│   │       │         │           │       │             │    │
│   │   ┌───┴───┐     │           │       ├── I²C Bus  │    │
│   │   │ Relay │◄────┼───────────┼───────┘             │    │
│   │   │ Module│     │           │       ├── Sensors  │    │
│   │   └───┬───┘     │           │       └── LEDs     │    │
│   │       │         │           │                     │    │
│   │  Output Ports   │           │                     │    │
│   └─────────────────┘           └─────────────────────┘    │
│                                                             │
│   SYNC_IN ◄────────────────────────────────► SYNC_OUT      │
└─────────────────────────────────────────────────────────────┘
```

## Connector Pinouts

### Power Input (IEC C14)
| Pin | Function |
|-----|----------|
| L | Line (Live) |
| N | Neutral |
| PE | Protective Earth |

### Output Ports (5x)
| Pin | Function |
|-----|----------|
| L | Switched Live |
| N | Neutral (direct) |
| PE | Protective Earth |

### Sensor Hub (JST-XH 6-pin)
| Pin | Function |
|-----|----------|
| 1 | 5V |
| 2 | GND |
| 3 | SDA |
| 4 | SCL |
| 5 | Analog 1 |
| 6 | Analog 2 |

### Daisy Chain (RJ45)
| Pin | Function |
|-----|----------|
| 1 | SYNC Signal |
| 2 | SYNC Ground |
| 3 | SDA |
| 4 | GND |
| 5 | GND |
| 6 | SCL |
| 7 | 5V |
| 8 | 5V |

## Cable Specifications

| Cable | AWG | Max Length | Notes |
|-------|-----|------------|-------|
| Mains Input | 14 AWG | 3m | IEC C14 cord |
| Output | 14 AWG | 3m | Per load rating |
| Daisy Chain | 24 AWG | 1m | Cat5e or better |
| Sensor | 26 AWG | 2m | Shielded recommended |

## Safety Notes

⚠️ **WARNING: Follow all wiring carefully**

- Double-check all connections before powering on
- Ensure proper wire gauges for current ratings
- Use appropriate connectors and crimps
- Keep AC and DC wiring separated
- Test with no load before connecting devices

## License

MIT License - see [LICENSE](../../LICENSE) for details.
