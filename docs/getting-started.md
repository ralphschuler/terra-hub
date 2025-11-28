# Getting Started with TerraHub

Welcome to TerraHub! This guide will help you set up your development environment and get started with the project.

## Prerequisites

### For Firmware Development
- [PlatformIO IDE](https://platformio.org/install/ide) (VSCode extension recommended)
- ESP32 development board
- USB cable for flashing

### For Web Panel Development
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) package manager

### For Simulator
- Node.js (v18 or higher)
- pnpm package manager

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/terra-hub.git
cd terra-hub
```

### 2. Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install all workspace dependencies
pnpm -r install
```

### 3. Running the Web Panel (Development)

```bash
cd apps/web-panel
pnpm dev
```

The web panel will be available at `http://localhost:5173`.

### 4. Running the Simulator

```bash
cd apps/simulator
pnpm dev
```

### 5. Building Firmware

```bash
cd apps/controller-firmware
pio run
```

### 6. Flashing Firmware

```bash
cd apps/controller-firmware
pio run --target upload
```

## Project Structure

- **apps/controller-firmware/** - ESP32 firmware (C++/PlatformIO)
- **apps/web-panel/** - Web-based control panel (Vue/React)
- **apps/simulator/** - Node.js chain & rule simulator
- **packages/protocol/** - I²C protocol definitions
- **packages/rules-engine/** - Rule processing logic
- **packages/config-schema/** - Configuration schemas
- **hardware/** - PCB designs, enclosures, wiring diagrams
- **tools/** - CLI utilities for flashing and configuration

## Next Steps

- Read the [Architecture Overview](./architecture-overview.md)
- Understand the [Protocol Specification](./protocol.md)
- Explore the hardware designs in the `hardware/` directory

## Getting Help

If you encounter issues:
1. Check the existing documentation
2. Search for similar issues in the GitHub repository
3. Open a new issue with detailed information about your problem

## Contributing

We welcome contributions! Please see the main README for guidelines on how to contribute to the project.
