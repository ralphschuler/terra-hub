/**
 * TerraHub I²C Protocol - Version 1.0
 *
 * This module provides TypeScript definitions and utilities for the
 * TerraHub I²C communication protocol.
 */

// =============================================================================
// Constants
// =============================================================================

/** Default I²C address for unassigned slaves */
export const DEFAULT_SLAVE_ADDRESS = 0x30;

/** Base address for assigned slaves (address = BASE + nodeId) */
export const ASSIGNED_SLAVE_BASE_ADDRESS = 0x30;

/** Protocol version */
export const PROTOCOL_VERSION = { major: 1, minor: 0 };

// =============================================================================
// Enumerations
// =============================================================================

/**
 * I²C Command codes
 */
export enum Command {
  // Enumeration commands (for unassigned slaves at default address)
  HELLO_UNASSIGNED = 0x01,
  ASSIGN_ID = 0x02,
  ENABLE_DOWNSTREAM = 0x03,

  // Regular commands (for assigned slaves)
  PING = 0x10,
  GET_NODE_INFO = 0x11,
  GET_PORTS = 0x12,
  GET_PORT_STATE = 0x13,
  SET_PORT_STATE = 0x14,
  GET_SENSOR_VALUES = 0x20,
  SET_CONFIG_CHUNK = 0x30,
  GET_CONFIG_HASH = 0x31,
}

/**
 * Response status codes
 */
export enum Status {
  OK = 0x00,
  UNKNOWN_COMMAND = 0x01,
  INVALID_PARAMETERS = 0x02,
  BUSY = 0x03,
  HARDWARE_ERROR = 0x04,
  GENERAL_ERROR = 0xff,
}

/**
 * Port types for relay outputs
 */
export enum PortType {
  UNUSED = 0x00,
  LIGHT = 0x01,
  HEATER = 0x02,
  PUMP = 0x03,
  MISTER = 0x04,
  ATOMIZER = 0x05,
  FAN = 0x06,
  OTHER = 0xff,
}

/**
 * Sensor types
 */
export enum SensorType {
  TEMPERATURE = 0x01,
  HUMIDITY = 0x02,
  LIGHT_LEVEL = 0x03,
  PRESSURE = 0x04,
}

// =============================================================================
// Interfaces
// =============================================================================

/**
 * Message structure
 */
export interface Message {
  command: Command;
  payload: Uint8Array;
}

/**
 * Response structure
 */
export interface Response {
  status: Status;
  payload: Uint8Array;
}

/**
 * Node information
 */
export interface NodeInfo {
  nodeId: number;
  firmwareVersion: {
    major: number;
    minor: number;
    patch: number;
  };
  hardwareRevision: number;
  portCount: number;
  sensorCount: number;
  flags: number;
  uptimeHours: number;
}

/**
 * Port configuration
 */
export interface PortConfig {
  portId: number;
  portType: PortType;
  flags: number;
}

/**
 * Port state
 */
export interface PortState {
  portId: number;
  state: boolean;
  currentMa: number;
}

/**
 * Sensor reading
 */
export interface SensorReading {
  sensorType: SensorType;
  value: number;
  unit: string;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Calculate XOR checksum for message validation
 */
export function calculateChecksum(data: Uint8Array): number {
  let checksum = 0;
  for (const byte of data) {
    checksum ^= byte;
  }
  return checksum;
}

/**
 * Create a message buffer with proper framing
 */
export function createMessage(command: Command, payload: Uint8Array = new Uint8Array(0)): Uint8Array {
  const length = payload.length;
  const buffer = new Uint8Array(length + 3); // command + length + payload + checksum

  buffer[0] = command;
  buffer[1] = length;

  for (let i = 0; i < length; i++) {
    buffer[2 + i] = payload[i];
  }

  buffer[length + 2] = calculateChecksum(buffer.subarray(0, length + 2));

  return buffer;
}

/**
 * Parse a response buffer
 */
export function parseResponse(buffer: Uint8Array): Response {
  if (buffer.length < 3) {
    throw new Error('Response buffer too short');
  }

  const status = buffer[0] as Status;
  const length = buffer[1];

  if (buffer.length < length + 3) {
    throw new Error('Response buffer incomplete');
  }

  const payload = buffer.slice(2, 2 + length);
  const expectedChecksum = calculateChecksum(buffer.subarray(0, length + 2));
  const actualChecksum = buffer[length + 2];

  if (expectedChecksum !== actualChecksum) {
    throw new Error('Checksum mismatch');
  }

  return { status, payload };
}

/**
 * Get the I²C address for a given node ID
 */
export function getNodeAddress(nodeId: number): number {
  return ASSIGNED_SLAVE_BASE_ADDRESS + nodeId;
}

/**
 * Parse node info from response payload
 */
export function parseNodeInfo(payload: Uint8Array): NodeInfo {
  if (payload.length < 10) {
    throw new Error('Invalid node info payload');
  }

  return {
    nodeId: payload[0],
    firmwareVersion: {
      major: payload[1],
      minor: payload[2],
      patch: payload[3],
    },
    hardwareRevision: payload[4],
    portCount: payload[5],
    sensorCount: payload[6],
    flags: (payload[7] | (payload[8] << 8)),
    uptimeHours: payload[9],
  };
}

/**
 * Parse port state from response payload
 */
export function parsePortState(payload: Uint8Array): PortState {
  if (payload.length < 4) {
    throw new Error('Invalid port state payload');
  }

  return {
    portId: payload[0],
    state: payload[1] === 1,
    currentMa: payload[2] | (payload[3] << 8),
  };
}

/**
 * Parse sensor readings from response payload
 */
export function parseSensorReadings(payload: Uint8Array): SensorReading[] {
  if (payload.length < 1) {
    throw new Error('Invalid sensor readings payload');
  }

  const count = payload[0];
  const readings: SensorReading[] = [];

  let offset = 1;
  for (let i = 0; i < count; i++) {
    if (offset + 4 > payload.length) {
      throw new Error('Incomplete sensor data');
    }

    const sensorType = payload[offset] as SensorType;
    const rawValue = payload[offset + 1] | (payload[offset + 2] << 8);

    let unit: string;
    let value: number;

    switch (sensorType) {
      case SensorType.TEMPERATURE:
        value = rawValue / 10;
        unit = '°C';
        break;
      case SensorType.HUMIDITY:
        value = rawValue / 10;
        unit = '%RH';
        break;
      case SensorType.LIGHT_LEVEL:
        value = rawValue;
        unit = 'lux';
        break;
      case SensorType.PRESSURE:
        value = rawValue;
        unit = 'hPa';
        break;
      default:
        value = rawValue;
        unit = '';
    }

    readings.push({ sensorType, value, unit });
    offset += 4;
  }

  return readings;
}

/**
 * Get human-readable port type name
 */
export function getPortTypeName(portType: PortType): string {
  switch (portType) {
    case PortType.UNUSED:
      return 'Unused';
    case PortType.LIGHT:
      return 'Light';
    case PortType.HEATER:
      return 'Heater';
    case PortType.PUMP:
      return 'Pump';
    case PortType.MISTER:
      return 'Mister';
    case PortType.ATOMIZER:
      return 'Atomizer';
    case PortType.FAN:
      return 'Fan';
    case PortType.OTHER:
      return 'Other';
    default:
      return 'Unknown';
  }
}

/**
 * Get human-readable sensor type name
 */
export function getSensorTypeName(sensorType: SensorType): string {
  switch (sensorType) {
    case SensorType.TEMPERATURE:
      return 'Temperature';
    case SensorType.HUMIDITY:
      return 'Humidity';
    case SensorType.LIGHT_LEVEL:
      return 'Light Level';
    case SensorType.PRESSURE:
      return 'Pressure';
    default:
      return 'Unknown';
  }
}
