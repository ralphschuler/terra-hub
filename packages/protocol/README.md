# @terra-hub/protocol

TerraHub I²C Protocol Definition and TypeScript Reference Client.

## Overview

This package provides:
- TypeScript definitions for the TerraHub I²C protocol
- Command and response type definitions
- Utility functions for message encoding/decoding
- Reference client implementation

## Installation

```bash
pnpm add @terra-hub/protocol
```

## Usage

```typescript
import { Command, PortType, createMessage } from '@terra-hub/protocol';

// Create a PING command
const pingMessage = createMessage(Command.PING);

// Parse a port state
import { parsePortState, PortState } from '@terra-hub/protocol';
const state: PortState = parsePortState(responseBuffer);
```

## Protocol Version

This package implements TerraHub Protocol v1.0.

See [Protocol Documentation](../../docs/protocol.md) for the full specification.
