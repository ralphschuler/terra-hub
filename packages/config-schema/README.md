# @terra-hub/config-schema

TerraHub Configuration Schemas - JSON & TypeScript schemas for ports, nodes, rules.

## Overview

This package provides:
- TypeScript type definitions for all TerraHub configuration objects
- JSON Schema files for configuration validation
- Utility functions for configuration validation and manipulation

## Installation

```bash
pnpm add @terra-hub/config-schema
```

## Usage

```typescript
import type {
  TerraHubConfig,
  NodeConfig,
  PortConfig,
  Rule,
  Schedule,
} from '@terra-hub/config-schema';

import { validateConfig, createDefaultConfig } from '@terra-hub/config-schema';

// Create a default configuration
const config = createDefaultConfig();

// Validate a configuration object
const { valid, errors } = validateConfig(config);
if (!valid) {
  console.error('Invalid configuration:', errors);
}
```

## Configuration Structure

```typescript
interface TerraHubConfig {
  version: string;
  nodes: NodeConfig[];
  rules: Rule[];
  schedules: Schedule[];
  settings: SystemSettings;
}
```

## JSON Schemas

JSON Schema files are available in the `schemas/` directory:
- `config.schema.json` - Full configuration schema
- `node.schema.json` - Node configuration schema
- `rule.schema.json` - Rule schema
- `schedule.schema.json` - Schedule schema

See the TypeScript source files for detailed type definitions.
