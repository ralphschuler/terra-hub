/**
 * TerraHub Simulator
 *
 * Node.js-based simulator for testing TerraHub chain and rule behavior.
 */

import { RulesEngine, Rule, SensorValues } from '@terra-hub/rules-engine';
import { NodeInfo, PortType, PortState } from '@terra-hub/protocol';
import { NodeConfig, createDefaultNode, PortConfig } from '@terra-hub/config-schema';

// =============================================================================
// Types
// =============================================================================

export interface SimulatorOptions {
  /** Number of nodes to simulate */
  nodeCount: number;
  /** Enable verbose logging */
  verbose?: boolean;
}

export interface VirtualNodeState {
  nodeId: number;
  isController: boolean;
  isEnumerated: boolean;
  config: NodeConfig;
  portStates: Map<number, boolean>;
  sensorValues: Map<string, number>;
}

// =============================================================================
// Virtual Node
// =============================================================================

/**
 * Virtual TerraHub node
 */
export class VirtualNode {
  public state: VirtualNodeState;

  constructor(nodeId: number, isController: boolean = false) {
    this.state = {
      nodeId,
      isController,
      isEnumerated: isController, // Controller is always enumerated
      config: createDefaultNode(nodeId),
      portStates: new Map([
        [1, false],
        [2, false],
        [3, false],
        [4, false],
        [5, false],
      ]),
      sensorValues: new Map([
        ['temperature', 25.0],
        ['humidity', 50.0],
      ]),
    };
  }

  /**
   * Get node info
   */
  getNodeInfo(): NodeInfo {
    return {
      nodeId: this.state.nodeId,
      firmwareVersion: { major: 0, minor: 1, patch: 0 },
      hardwareRevision: 1,
      portCount: 5,
      sensorCount: 2,
      flags: 0,
      uptimeHours: 0,
    };
  }

  /**
   * Get port state
   */
  getPortState(portId: number): PortState {
    return {
      portId,
      state: this.state.portStates.get(portId) || false,
      currentMa: this.state.portStates.get(portId) ? 100 : 0, // Simulate current when on
    };
  }

  /**
   * Set port state
   */
  setPortState(portId: number, state: boolean): void {
    this.state.portStates.set(portId, state);
  }

  /**
   * Get sensor value
   */
  getSensorValue(sensorName: string): number {
    return this.state.sensorValues.get(sensorName) || 0;
  }

  /**
   * Set sensor value
   */
  setSensorValue(sensorName: string, value: number): void {
    this.state.sensorValues.set(sensorName, value);
  }

  /**
   * Get all sensor values as an object
   */
  getAllSensorValues(): SensorValues {
    const values: SensorValues = {};
    for (const [key, value] of this.state.sensorValues) {
      values[key] = value;
    }
    return values;
  }
}

// =============================================================================
// Simulator
// =============================================================================

/**
 * TerraHub chain simulator
 */
export class Simulator {
  private options: SimulatorOptions;
  private nodes: Map<number, VirtualNode> = new Map();
  private rulesEngine: RulesEngine;
  private running: boolean = false;

  constructor(options: SimulatorOptions) {
    this.options = {
      verbose: false,
      ...options,
    };
    this.rulesEngine = new RulesEngine();
  }

  /**
   * Start the simulation
   */
  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.log('Starting simulation...');
    this.running = true;

    // Create nodes
    for (let i = 1; i <= this.options.nodeCount; i++) {
      const isController = i === 1;
      const node = new VirtualNode(i, isController);
      this.nodes.set(i, node);
      this.log(`Created ${isController ? 'controller' : 'slave'} node ${i}`);
    }

    // Simulate enumeration
    await this.simulateEnumeration();

    this.log('Simulation started');
  }

  /**
   * Stop the simulation
   */
  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.log('Stopping simulation...');
    this.running = false;
    this.nodes.clear();
    this.rulesEngine.reset();
    this.log('Simulation stopped');
  }

  /**
   * Simulate the enumeration process
   */
  private async simulateEnumeration(): Promise<void> {
    this.log('Starting enumeration...');

    for (let nodeId = 2; nodeId <= this.options.nodeCount; nodeId++) {
      const node = this.nodes.get(nodeId);
      if (node) {
        // Simulate HELLO_UNASSIGNED
        this.log(`  Node ${nodeId}: HELLO_UNASSIGNED`);
        
        // Simulate ASSIGN_ID
        node.state.isEnumerated = true;
        this.log(`  Node ${nodeId}: ASSIGN_ID -> ${nodeId}`);
        
        // Simulate ENABLE_DOWNSTREAM
        this.log(`  Node ${nodeId}: ENABLE_DOWNSTREAM`);
        
        // Small delay to simulate I2C communication
        await this.delay(10);
      }
    }

    this.log('Enumeration complete');
  }

  /**
   * Get a node by ID
   */
  getNode(nodeId: number): VirtualNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): VirtualNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get node status
   */
  getNodeStatus(nodeId: number): VirtualNodeState | undefined {
    return this.nodes.get(nodeId)?.state;
  }

  /**
   * Set sensor value for a node
   */
  setSensorValue(nodeId: number, sensor: string, value: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.setSensorValue(sensor, value);
      this.log(`Node ${nodeId}: ${sensor} = ${value}`);
    }
  }

  /**
   * Add a rule to the simulator
   */
  addRule(rule: Rule): void {
    this.rulesEngine.addRule(rule);
    this.log(`Added rule: ${rule.name}`);
  }

  /**
   * Evaluate rules and return actions
   */
  evaluate(): void {
    // Collect sensor values from all nodes
    const allSensorValues: SensorValues = {};
    
    for (const node of this.nodes.values()) {
      const prefix = `node${node.state.nodeId}_`;
      const values = node.getAllSensorValues();
      for (const [key, value] of Object.entries(values)) {
        allSensorValues[prefix + key] = value;
        // Also add without prefix for convenience
        if (!allSensorValues[key]) {
          allSensorValues[key] = value;
        }
      }
    }

    // Evaluate rules
    const results = this.rulesEngine.evaluate(allSensorValues);

    // Apply actions
    for (const result of results) {
      if (result.triggered && result.action) {
        const node = this.nodes.get(result.action.nodeId);
        if (node) {
          node.setPortState(result.action.portId, result.action.state);
          this.log(`Rule "${result.ruleName}" triggered: Node ${result.action.nodeId} Port ${result.action.portId} = ${result.action.state ? 'ON' : 'OFF'}`);
        }
      }
    }
  }

  /**
   * Log message if verbose mode is enabled
   */
  private log(message: string): void {
    if (this.options.verbose) {
      console.log(`[Simulator] ${message}`);
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =============================================================================
// Main entry point
// =============================================================================

async function main() {
  console.log('TerraHub Simulator');
  console.log('==================');
  console.log();

  const sim = new Simulator({ nodeCount: 3, verbose: true });
  await sim.start();

  // Example: Add a humidity rule
  sim.addRule({
    id: 'humidity-control',
    name: 'Low Humidity Control',
    enabled: true,
    condition: {
      type: 'threshold',
      sensor: 'humidity',
      operator: 'lt',
      value: 30,
      hysteresis: 5,
    },
    action: {
      type: 'set-port',
      nodeId: 1,
      portId: 3,
      state: true,
      minDurationSec: 60,
    },
  });

  // Simulate low humidity
  console.log('\nSimulating low humidity (25%)...');
  sim.setSensorValue(1, 'humidity', 25);
  sim.evaluate();

  // Check port state
  const node = sim.getNode(1);
  if (node) {
    const portState = node.getPortState(3);
    console.log(`Port 3 state: ${portState.state ? 'ON' : 'OFF'}`);
  }

  // Simulate humidity recovery
  console.log('\nSimulating humidity recovery (40%)...');
  sim.setSensorValue(1, 'humidity', 40);
  sim.evaluate();

  // Check port state again
  if (node) {
    const portState = node.getPortState(3);
    console.log(`Port 3 state: ${portState.state ? 'ON' : 'OFF'}`);
  }

  await sim.stop();
  console.log('\nSimulation complete!');
}

// Export for library usage
export { main };

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
