# TerraHub Simulator

Node.js-based simulator for testing TerraHub chain and rule behavior without hardware.

## Overview

The simulator provides:
- Virtual TerraHub node simulation
- I²C protocol emulation
- Sensor value generation
- Rules engine testing
- Chain enumeration simulation

## Installation

```bash
pnpm install
```

## Usage

```bash
# Start the simulator
pnpm start

# Run in development mode with hot reload
pnpm dev

# Run tests
pnpm test
```

## Features

### Node Simulation

Create virtual TerraHub nodes with configurable:
- Number of relay channels
- Sensor types and values
- I²C addresses

### Chain Simulation

Simulate the Daisy-Chain topology:
- Auto-enumeration process
- Controller/Slave role assignment
- Node discovery and ID assignment

### Sensor Simulation

Generate realistic sensor data:
- Temperature curves (day/night cycles)
- Humidity patterns
- Light level changes

### Rules Testing

Test the rules engine with:
- Custom rule definitions
- Simulated sensor inputs
- Action verification

## API

```typescript
import { Simulator, VirtualNode } from '@terra-hub/simulator';

// Create a simulator with 3 nodes
const sim = new Simulator({ nodeCount: 3 });

// Start the simulation
await sim.start();

// Get node status
const status = sim.getNodeStatus(1);

// Set sensor value
sim.setSensorValue(1, 'humidity', 23);

// Trigger rule evaluation
const actions = await sim.evaluate();

// Stop the simulation
await sim.stop();
```

## License

MIT License - see [LICENSE](../../LICENSE) for details.
