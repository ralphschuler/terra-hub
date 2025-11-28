/**
 * TerraHub Configuration Schema
 *
 * TypeScript type definitions for all TerraHub configuration objects.
 */

// =============================================================================
// Port Types
// =============================================================================

/**
 * Available port types
 */
export type PortType = 'unused' | 'light' | 'heater' | 'pump' | 'mister' | 'atomizer' | 'fan' | 'other';

/**
 * Port configuration
 */
export interface PortConfig {
  /** Port ID (1-5) */
  portId: number;
  /** Port type */
  type: PortType;
  /** Human-readable name */
  name: string;
  /** Whether the port is enabled */
  enabled: boolean;
  /** Optional description */
  description?: string;
}

// =============================================================================
// Sensor Types
// =============================================================================

/**
 * Available sensor types
 */
export type SensorType = 'temperature' | 'humidity' | 'light' | 'pressure';

/**
 * Sensor configuration
 */
export interface SensorConfig {
  /** Sensor ID */
  sensorId: number;
  /** Sensor type */
  type: SensorType;
  /** Human-readable name */
  name: string;
  /** Whether the sensor is enabled */
  enabled: boolean;
  /** Polling interval in seconds */
  pollIntervalSec: number;
  /** Optional calibration offset */
  calibrationOffset?: number;
}

// =============================================================================
// Node Configuration
// =============================================================================

/**
 * Node configuration
 */
export interface NodeConfig {
  /** Node ID (assigned during enumeration) */
  nodeId: number;
  /** Human-readable name */
  name: string;
  /** Port configurations */
  ports: PortConfig[];
  /** Sensor configurations */
  sensors: SensorConfig[];
  /** Optional description */
  description?: string;
}

// =============================================================================
// Rules
// =============================================================================

/**
 * Comparison operators for rule conditions
 */
export type ComparisonOperator = 'lt' | 'gt' | 'lte' | 'gte' | 'eq' | 'neq';

/**
 * Rule condition
 */
export interface RuleCondition {
  /** Condition type */
  type: 'threshold';
  /** Sensor to monitor (by type name) */
  sensor: string;
  /** Comparison operator */
  operator: ComparisonOperator;
  /** Threshold value */
  value: number;
  /** Hysteresis value (to prevent rapid toggling) */
  hysteresis?: number;
}

/**
 * Rule action
 */
export interface RuleAction {
  /** Action type */
  type: 'set-port';
  /** Target node ID */
  nodeId: number;
  /** Target port ID */
  portId: number;
  /** Desired state (true = ON, false = OFF) */
  state: boolean;
  /** Minimum duration in seconds before action can be reversed */
  minDurationSec?: number;
}

/**
 * Rule definition
 */
export interface Rule {
  /** Unique rule ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** Whether the rule is enabled */
  enabled: boolean;
  /** Trigger condition */
  condition: RuleCondition;
  /** Action to execute when condition is met */
  action: RuleAction;
  /** Optional description */
  description?: string;
}

// =============================================================================
// Schedules
// =============================================================================

/**
 * Days of the week
 */
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * Time of day (HH:MM format)
 */
export type TimeOfDay = string;

/**
 * Schedule time entry
 */
export interface ScheduleEntry {
  /** Time of day (HH:MM format) */
  time: TimeOfDay;
  /** Desired state (true = ON, false = OFF) */
  state: boolean;
}

/**
 * Schedule definition
 */
export interface Schedule {
  /** Unique schedule ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** Whether the schedule is enabled */
  enabled: boolean;
  /** Target node ID */
  nodeId: number;
  /** Target port ID */
  portId: number;
  /** Days of week when schedule is active */
  days: DayOfWeek[];
  /** Time entries */
  entries: ScheduleEntry[];
  /** Optional description */
  description?: string;
}

// =============================================================================
// System Settings
// =============================================================================

/**
 * Network configuration
 */
export interface NetworkSettings {
  /** WiFi SSID */
  ssid?: string;
  /** WiFi password (stored securely) */
  password?: string;
  /** Use DHCP */
  dhcp: boolean;
  /** Static IP address (if DHCP disabled) */
  staticIp?: string;
  /** Gateway address (if DHCP disabled) */
  gateway?: string;
  /** Subnet mask (if DHCP disabled) */
  subnet?: string;
  /** DNS server (if DHCP disabled) */
  dns?: string;
}

/**
 * Time configuration
 */
export interface TimeSettings {
  /** NTP server address */
  ntpServer: string;
  /** Timezone offset in hours */
  timezoneOffset: number;
  /** Use daylight saving time */
  useDst: boolean;
}

/**
 * WLED integration settings
 */
export interface WledSettings {
  /** WLED enabled */
  enabled: boolean;
  /** WLED device IP address */
  address?: string;
  /** API type */
  apiType: 'http' | 'websocket' | 'udp';
}

/**
 * Diagnostic settings
 */
export interface DiagnosticSettings {
  /** Enable buzzer for fault alerts */
  buzzerEnabled: boolean;
  /** Current threshold for fault detection (mA) */
  currentThresholdMa: number;
}

/**
 * System settings
 */
export interface SystemSettings {
  /** Network configuration */
  network: NetworkSettings;
  /** Time configuration */
  time: TimeSettings;
  /** WLED integration */
  wled: WledSettings;
  /** Diagnostic settings */
  diagnostics: DiagnosticSettings;
}

// =============================================================================
// Main Configuration
// =============================================================================

/**
 * Complete TerraHub configuration
 */
export interface TerraHubConfig {
  /** Configuration version */
  version: string;
  /** Node configurations */
  nodes: NodeConfig[];
  /** Rule definitions */
  rules: Rule[];
  /** Schedule definitions */
  schedules: Schedule[];
  /** System settings */
  settings: SystemSettings;
}

// =============================================================================
// Sensor Values (for rule evaluation)
// =============================================================================

/**
 * Sensor values object (sensor name -> value)
 */
export interface SensorValues {
  [sensorName: string]: number;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create a default configuration object
 */
export function createDefaultConfig(): TerraHubConfig {
  return {
    version: '1.0',
    nodes: [],
    rules: [],
    schedules: [],
    settings: {
      network: {
        dhcp: true,
      },
      time: {
        ntpServer: 'pool.ntp.org',
        timezoneOffset: 0,
        useDst: false,
      },
      wled: {
        enabled: false,
        apiType: 'http',
      },
      diagnostics: {
        buzzerEnabled: true,
        currentThresholdMa: 50,
      },
    },
  };
}

/**
 * Create a default node configuration
 */
export function createDefaultNode(nodeId: number): NodeConfig {
  return {
    nodeId,
    name: `Node ${nodeId}`,
    ports: [
      { portId: 1, type: 'unused', name: 'Port 1', enabled: true },
      { portId: 2, type: 'unused', name: 'Port 2', enabled: true },
      { portId: 3, type: 'unused', name: 'Port 3', enabled: true },
      { portId: 4, type: 'unused', name: 'Port 4', enabled: true },
      { portId: 5, type: 'unused', name: 'Port 5', enabled: true },
    ],
    sensors: [],
  };
}

/**
 * Create a default rule
 */
export function createDefaultRule(id: string): Rule {
  return {
    id,
    name: 'New Rule',
    enabled: false,
    condition: {
      type: 'threshold',
      sensor: 'humidity',
      operator: 'lt',
      value: 50,
      hysteresis: 5,
    },
    action: {
      type: 'set-port',
      nodeId: 1,
      portId: 1,
      state: true,
      minDurationSec: 60,
    },
  };
}

/**
 * Create a default schedule
 */
export function createDefaultSchedule(id: string): Schedule {
  return {
    id,
    name: 'New Schedule',
    enabled: false,
    nodeId: 1,
    portId: 1,
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    entries: [
      { time: '08:00', state: true },
      { time: '20:00', state: false },
    ],
  };
}

/**
 * Simple configuration validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateConfig(config: TerraHubConfig): ValidationResult {
  const errors: string[] = [];

  // Check version
  if (!config.version) {
    errors.push('Missing configuration version');
  }

  // Check nodes
  const nodeIds = new Set<number>();
  for (const node of config.nodes) {
    if (nodeIds.has(node.nodeId)) {
      errors.push(`Duplicate node ID: ${node.nodeId}`);
    }
    nodeIds.add(node.nodeId);

    if (!node.name) {
      errors.push(`Node ${node.nodeId} is missing a name`);
    }
  }

  // Check rules
  const ruleIds = new Set<string>();
  for (const rule of config.rules) {
    if (ruleIds.has(rule.id)) {
      errors.push(`Duplicate rule ID: ${rule.id}`);
    }
    ruleIds.add(rule.id);

    if (!rule.name) {
      errors.push(`Rule ${rule.id} is missing a name`);
    }
  }

  // Check schedules
  const scheduleIds = new Set<string>();
  for (const schedule of config.schedules) {
    if (scheduleIds.has(schedule.id)) {
      errors.push(`Duplicate schedule ID: ${schedule.id}`);
    }
    scheduleIds.add(schedule.id);

    if (!schedule.name) {
      errors.push(`Schedule ${schedule.id} is missing a name`);
    }

    // Validate time format
    for (const entry of schedule.entries) {
      if (!/^\d{2}:\d{2}$/.test(entry.time)) {
        errors.push(`Schedule ${schedule.id} has invalid time format: ${entry.time}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
