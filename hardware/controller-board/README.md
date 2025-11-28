# TerraHub Controller Board

KiCad PCB design files for the TerraHub controller board.

## Overview

This directory contains the PCB design for the main TerraHub controller board featuring:
- ESP32-WROOM-32 module
- 5-channel relay control
- 5-channel current sensing (Hall-effect or CT)
- I²C sensor hub
- Daisy-chain connectors
- 5V power distribution

## Design Files

```
controller-board/
├─ terrahub.kicad_pro       # KiCad project file
├─ terrahub.kicad_sch       # Schematic
├─ terrahub.kicad_pcb       # PCB layout
├─ symbols/                 # Custom schematic symbols
├─ footprints/              # Custom footprints
└─ gerber/                  # Manufacturing files
```

## Bill of Materials

See `BOM.md` for the complete bill of materials.

## Manufacturing

Gerber files are provided for common PCB manufacturers (JLCPCB, PCBWay, etc.).

## Safety Notes

⚠️ **WARNING: This design involves mains voltage (230V AC)**

- Only qualified persons should work with mains voltage
- Ensure proper isolation between AC and DC sections
- Follow all local electrical codes and regulations
- Use appropriate fuses and circuit protection
- Test thoroughly before connecting to mains power

## Specifications

| Parameter | Value |
|-----------|-------|
| Supply Voltage | 5V DC |
| Relay Rating | 10A @ 250V AC per channel |
| Current Sensing | 0-10A per channel |
| I²C Voltage | 3.3V (with level shifter) |
| Dimensions | TBD |

## License

MIT License - see [LICENSE](../../LICENSE) for details.

Hardware designs are also available under CERN-OHL-P v2.
