# TerraHub – Open Terrarium Control Hub

TerraHub is a modular, open-source control and diagnostics system for terrariums and vivariums. The platform enables time-controlled switching of 230V consumers (lights, heaters, pumps, misters, atomizers) while simultaneously monitoring actual current flow for reliable fault detection.

Multiple identically flashed TerraHub units can automatically form a scalable node chain (Controller → Slave → Slave …) to provide more than 5 channels per box.

## Core Features

- **5 × Modular 230V Relay Channels (OUT1 – OUT5)** with pluggable expansion
- **Current Flow Verification** per channel via galvanically isolated Hall-effect or current transformer measurement
- **Time Scheduler** for day/night cycles per module
- **Configurable Rules Engine** (thresholds, hysteresis, minimum runtime)
- **Automatic Role Assignment & ID Enumeration** via Daisy-Chain topology (SYNC_IN → SYNC_OUT)
- **External WS2812 LED Strip Control** via WLED API (HTTP/JSON, WebSocket, UDP)
- **Local Mobile-Optimized Web Dashboard** with:
  - Port-type mapping ("Which module runs on which port?")
  - Schedule editor
  - Rules editor ("e.g., Humidity < 25% → Atomizer ON")
  - Configuration backup/restore in JSON format
  - Live status display (temperature, humidity, relay status, current flow diagnostics)

## Hardware Architecture (Conceptual)

### AC Section (230V, strictly isolated & fused)
- Cold appliance input (IEC C14), main switch, fuse
- 230V phase routed via 5-channel relay PCB
- Relay output routed in series through Hall-effect sensor (or via current transformer around phase) → Consumer ports
- Neutral conductor directly routed back in star configuration

### DC Section (5V Bus)
- 5V DC power supply (10A) for main ESP32, LED strips, display, sensor hub, relay coil logic
- Common GND as reference across all TerraHub boxes in the Daisy-Chain

### Hubs/Ports (Internal)
- **Hub 1:** Relay Hub (GND/CTRL/optional 5V)
- **Hub 2:** Sensor/LED Hub (5V/GND/SDA/SCL/optional analog pins)
- **2 × Daisy-Chain Ports:** SYNC_IN (upstream presence detection) + SYNC_OUT (downstream enable)

## Auto-Enumeration & Controller Selection

- All boxes are electrically I²C bus parallel, but logically serially addressed (topology IN → OUT → IN…)
- The Controller is the first box without active upstream detection at the SYNC_IN port → nodeId = 1
- Slaves start as unassigned slave at default address (e.g., 0x30)
- The Controller performs handshake + side-scan:
  1. `HELLO_UNASSIGNED` on default address
  2. `ASSIGN_ID` → Slave stores nodeId = 2, 3, 4, … (based on position)
  3. `ENABLE_DOWNSTREAM` → Slave logically opens the next hop (bus switch ON)
  4. Repeat until no unassigned slave responds
- **Result:** IDs reflect physical position in module chain, no manual configuration needed.

## Local I²C Protocol (Short Spec)

### Commands for Unassigned Slaves (Default Address)
| Command | Code |
|---------|------|
| `HELLO_UNASSIGNED` | 0x01 |
| `ASSIGN_ID` (Payload: 1 byte nodeId) | 0x02 |
| `ENABLE_DOWNSTREAM` | 0x03 |

### Commands for Regular Slaves (Own Address = 0x30 + nodeId)
- `GET_NODE_INFO`
- `GET_PORTS`
- `GET_PORT_STATE`
- `SET_PORT_STATE`
- `GET_SENSOR_VALUES`
- `SET_CONFIG_CHUNK`
- `GET_CONFIG_HASH`
- `PING`

## Monorepo Layout

```
terra-hub/
├─ apps/
│  ├─ controller-firmware/  # C++/PlatformIO/ESP-Firmware
│  ├─ web-panel/            # Vite/Vue3 or Vite/React UI (Mobile-first)
│  └─ simulator/            # Node-based simulator for chain & rule tests
│
├─ packages/
│  ├─ protocol/             # I²C protocol definition + TS reference client
│  ├─ rules-engine/         # TS rules engine core logic
│  └─ config-schema/        # JSON & TS schemas for ports, nodes, rules
│
├─ hardware/
│  ├─ controller-board/     # PCB design (KiCad)
│  ├─ enclosure/            # CAD / STL / STEP enclosure files
│  └─ wiring/               # Wiring diagrams & electronics block diagrams
│
├─ docs/
│  ├─ getting-started.md
│  ├─ architecture-overview.md
│  └─ protocol.md
│
├─ tools/
│  ├─ flasher/              # Flash & provisioning CLI (bash/ts)
│  └─ config-cli/           # WiFi/USB config upload tool
│
├─ README.md
└─ LICENSE = MIT
```

## Web Panel Concept (Mobile)

### Page Modules
1. **Dashboard** (Live State)
2. **Ports → Modules** (Assignment via dropdowns)
3. **Schedules** (Clock/Day editor)
4. **Rules** (Sensor threshold rules, AND/OR expandable later)
5. **Network/Time/Backup** (Provisioning & CI future-proofing)

### Example Rule (Created in Panel)
> Humidity falls below 25% → OUT[n], Type = Atomizer, state = ON, minDurationSec = 60, Hysteresis = 2%

### Bulb/Consumer Diagnostics via Buzzer
- Lamps are switched on via schedule
- If relay = ON but current measurement = 0 → Buzzer outputs ID as number of beeps (500ms interval), then 3s pause

## Future-Proofing

- Logical IDs are position-based, configuration is pin-independent (mapping layer)
- Events in the cluster are not coded directly via pins, but via port IDs (1:OUT3, 2:S1, etc.)
- Automated builds recommended for UI & firmware CI (e.g., with GitHub Actions pipelines)
- Sensor & output modules are class-based and generically expandable
- Protocol is strictly versionable (protocol/v1, protocol/v2 …)
- Config exportable/importable as JSON

## Community Approach

- TerraHub is released as identical node software
- No central cloud dependency; Controller can function autonomously or via WiFi/NTP
- External modules (e.g., additional boxes) extend via Daisy-Chain
- Panel-to-firmware config remains loss-free & migration-friendly

## Getting Started

See [docs/getting-started.md](./docs/getting-started.md) for setup instructions.

## License

MIT License - see [LICENSE](./LICENSE) for details.
