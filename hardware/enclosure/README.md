# TerraHub Enclosure

CAD files for the TerraHub enclosure.

## Overview

This directory contains 3D models and drawings for the TerraHub enclosure:
- Main enclosure body
- Front panel with ventilation
- Rear panel with connectors
- Internal mounting brackets
- Cable glands

## File Formats

```
enclosure/
├─ STEP/                    # STEP files for CAD import
├─ STL/                     # STL files for 3D printing
├─ F3D/                     # Fusion 360 source files
└─ DXF/                     # 2D drawings for laser cutting
```

## Design Features

- **IP54 rated** (splash-proof)
- **Ventilation slots** for heat dissipation
- **DIN rail mounting** option
- **Wall mounting** holes
- **Cable glands** for wire entry
- **LED indicators** visible through front panel

## Manufacturing Options

### 3D Printing

- Material: PETG or ABS recommended (heat resistance)
- Layer height: 0.2mm
- Infill: 30%
- Supports: Required for some parts

### Injection Molding

STEP files provided for professional manufacturing.

### Laser Cutting

DXF files provided for acrylic or sheet metal panels.

## Dimensions

| Parameter | Value |
|-----------|-------|
| Width | TBD |
| Height | TBD |
| Depth | TBD |
| Wall Thickness | 2.5mm |

## Safety Notes

⚠️ **WARNING: This enclosure houses mains voltage components**

- Use flame-retardant materials
- Ensure proper ventilation
- Verify IP rating for your environment
- Label all access points appropriately

## License

MIT License - see [LICENSE](../../LICENSE) for details.

Hardware designs are also available under CERN-OHL-P v2.
