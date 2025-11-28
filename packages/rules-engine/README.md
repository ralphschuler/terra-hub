# @terra-hub/rules-engine

TerraHub Rules Engine - Condition evaluation and action triggering.

## Overview

The rules engine evaluates sensor readings against user-defined rules and triggers appropriate actions on relay outputs. It supports:

- Threshold-based conditions (greater than, less than, equals)
- Hysteresis to prevent rapid on/off cycling
- Minimum duration requirements
- Time-based scheduling

## Installation

```bash
pnpm add @terra-hub/rules-engine
```

## Usage

```typescript
import { RulesEngine, Rule, Condition } from '@terra-hub/rules-engine';

const engine = new RulesEngine();

// Add a rule
const rule: Rule = {
  id: 'humidity-control',
  name: 'Low Humidity Alert',
  enabled: true,
  condition: {
    type: 'threshold',
    sensor: 'humidity',
    operator: 'lt',
    value: 25,
    hysteresis: 2,
  },
  action: {
    type: 'set-port',
    nodeId: 1,
    portId: 3,
    state: true,
    minDurationSec: 60,
  },
};

engine.addRule(rule);

// Evaluate with current sensor values
const actions = engine.evaluate({
  humidity: 23,
  temperature: 25,
});
```

## Rule Structure

See [@terra-hub/config-schema](../config-schema/README.md) for the complete rule schema definition.
