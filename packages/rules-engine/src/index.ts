/**
 * TerraHub Rules Engine
 *
 * Evaluates sensor readings against user-defined rules and triggers
 * appropriate actions on relay outputs.
 */

import type { Rule, RuleCondition, RuleAction, SensorValues } from '@terra-hub/config-schema';

// =============================================================================
// Types
// =============================================================================

/**
 * Result of rule evaluation
 */
export interface EvaluationResult {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  action: RuleAction | null;
  reason: string;
}

/**
 * Active action state (for tracking duration and hysteresis)
 */
interface ActiveAction {
  ruleId: string;
  startTime: number;
  minEndTime: number;
  action: RuleAction;
}

// =============================================================================
// Rules Engine
// =============================================================================

/**
 * Rules Engine for TerraHub
 *
 * Evaluates sensor conditions and determines which actions should be executed.
 */
export class RulesEngine {
  private rules: Map<string, Rule> = new Map();
  private activeActions: Map<string, ActiveAction> = new Map();
  private lastValues: Map<string, number> = new Map();

  /**
   * Add a rule to the engine
   */
  addRule(rule: Rule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove a rule from the engine
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    this.activeActions.delete(ruleId);
  }

  /**
   * Get all rules
   */
  getRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Enable or disable a rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * Evaluate all rules against current sensor values
   */
  evaluate(sensorValues: SensorValues): EvaluationResult[] {
    const results: EvaluationResult[] = [];
    const now = Date.now();

    for (const rule of this.rules.values()) {
      const result = this.evaluateRule(rule, sensorValues, now);
      results.push(result);
    }

    // Update last values for hysteresis calculation
    for (const [key, value] of Object.entries(sensorValues)) {
      this.lastValues.set(key, value);
    }

    return results;
  }

  /**
   * Evaluate a single rule
   */
  private evaluateRule(rule: Rule, sensorValues: SensorValues, now: number): EvaluationResult {
    // Check if rule is enabled
    if (!rule.enabled) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: false,
        action: null,
        reason: 'Rule is disabled',
      };
    }

    // Check if there's an active action with minimum duration not yet met
    const activeAction = this.activeActions.get(rule.id);
    if (activeAction && now < activeAction.minEndTime) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: true,
        action: activeAction.action,
        reason: `Minimum duration not yet met (${Math.ceil((activeAction.minEndTime - now) / 1000)}s remaining)`,
      };
    }

    // Evaluate the condition
    const conditionMet = this.evaluateCondition(rule.condition, sensorValues);

    if (conditionMet) {
      // Start or continue the action
      if (!activeAction) {
        const minDuration = rule.action.minDurationSec || 0;
        this.activeActions.set(rule.id, {
          ruleId: rule.id,
          startTime: now,
          minEndTime: now + (minDuration * 1000),
          action: rule.action,
        });
      }

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: true,
        action: rule.action,
        reason: 'Condition met',
      };
    } else {
      // Condition no longer met, clear active action if min duration is met
      if (activeAction && now >= activeAction.minEndTime) {
        this.activeActions.delete(rule.id);
      }

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: false,
        action: null,
        reason: 'Condition not met',
      };
    }
  }

  /**
   * Evaluate a condition against sensor values
   */
  private evaluateCondition(condition: RuleCondition, sensorValues: SensorValues): boolean {
    const currentValue = sensorValues[condition.sensor];

    if (currentValue === undefined) {
      return false;
    }

    const threshold = condition.value;
    const hysteresis = condition.hysteresis || 0;

    // Get the last value for hysteresis calculation
    const lastValue = this.lastValues.get(condition.sensor);
    const wasTriggered = lastValue !== undefined && this.compareValue(lastValue, condition.operator, threshold);

    // Apply hysteresis - use different threshold depending on current state
    let effectiveThreshold = threshold;
    if (wasTriggered && hysteresis > 0) {
      switch (condition.operator) {
        case 'lt':
          effectiveThreshold = threshold + hysteresis;
          break;
        case 'gt':
          effectiveThreshold = threshold - hysteresis;
          break;
        case 'lte':
          effectiveThreshold = threshold + hysteresis;
          break;
        case 'gte':
          effectiveThreshold = threshold - hysteresis;
          break;
      }
    }

    return this.compareValue(currentValue, condition.operator, effectiveThreshold);
  }

  /**
   * Compare a value against a threshold using the specified operator
   */
  private compareValue(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'lt':
        return value < threshold;
      case 'gt':
        return value > threshold;
      case 'lte':
        return value <= threshold;
      case 'gte':
        return value >= threshold;
      case 'eq':
        return value === threshold;
      case 'neq':
        return value !== threshold;
      default:
        return false;
    }
  }

  /**
   * Get currently active actions
   */
  getActiveActions(): RuleAction[] {
    return Array.from(this.activeActions.values()).map(a => a.action);
  }

  /**
   * Clear all state
   */
  reset(): void {
    this.activeActions.clear();
    this.lastValues.clear();
  }
}

// Re-export types from config-schema
export type { Rule, RuleCondition, RuleAction, SensorValues } from '@terra-hub/config-schema';
