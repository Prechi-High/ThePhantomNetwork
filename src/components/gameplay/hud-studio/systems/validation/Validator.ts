/**
 * Validator - Main validation engine
 * 
 * Runs validation rules against components and aggregates results.
 */

import type { ComponentInstance } from '../state/slices/componentsSlice';
import type {
  ValidationRule,
  ValidationIssue,
  ValidationResult,
  ComponentValidationResult,
  ValidationConfig,
} from './types';
import { ALL_RULES } from './rules';

export class Validator {
  private rules: ValidationRule[] = ALL_RULES;
  private config: ValidationConfig = {
    enabled: true,
    debounceMs: 500,
    rules: {
      overlap: true,
      safeArea: true,
      touchTarget: true,
      offscreen: true,
    },
  };

  /**
   * Set validation configuration
   */
  setConfig(config: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ValidationConfig {
    return { ...this.config };
  }

  /**
   * Enable/disable specific rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * Validate all components
   * 
   * @param components - All component instances
   * @param viewport - Viewport dimensions
   * @returns Validation result
   */
  validateAll(
    components: Record<string, ComponentInstance>,
    viewport: { width: number; height: number }
  ): ValidationResult {
    if (!this.config.enabled) {
      return {
        timestamp: Date.now(),
        components: [],
        totalErrors: 0,
        totalWarnings: 0,
        totalIssues: 0,
        isValid: true,
      };
    }

    const componentResults: ComponentValidationResult[] = [];
    let totalErrors = 0;
    let totalWarnings = 0;

    // Validate each component
    Object.values(components).forEach(component => {
      const result = this.validateComponent(component, components, viewport);
      componentResults.push(result);

      totalErrors += result.issues.filter(i => i.severity === 'error').length;
      totalWarnings += result.issues.filter(i => i.severity === 'warning').length;
    });

    return {
      timestamp: Date.now(),
      components: componentResults,
      totalErrors,
      totalWarnings,
      totalIssues: totalErrors + totalWarnings,
      isValid: totalErrors === 0,
    };
  }

  /**
   * Validate a single component
   * 
   * @param component - Component to validate
   * @param allComponents - All components (for overlap detection)
   * @param viewport - Viewport dimensions
   * @returns Component validation result
   */
  validateComponent(
    component: ComponentInstance,
    allComponents: Record<string, ComponentInstance>,
    viewport: { width: number; height: number }
  ): ComponentValidationResult {
    const issues: ValidationIssue[] = [];

    // Run enabled rules
    const enabledRules = this.rules.filter(rule => {
      // Check if rule is enabled in config
      const configKey = rule.id as keyof ValidationConfig['rules'];
      return rule.enabled && this.config.rules[configKey] !== false;
    });

    enabledRules.forEach(rule => {
      try {
        const ruleIssues = rule.validate(component, allComponents, viewport);
        issues.push(...ruleIssues);
      } catch (error) {
        console.error(`Validation rule ${rule.id} failed:`, error);
      }
    });

    return {
      componentId: component.id,
      issues,
      hasErrors: issues.some(i => i.severity === 'error'),
      hasWarnings: issues.some(i => i.severity === 'warning'),
    };
  }

  /**
   * Get all available rules
   */
  getRules(): ValidationRule[] {
    return [...this.rules];
  }

  /**
   * Auto-fix all fixable issues
   * 
   * @param result - Validation result
   * @returns Number of issues fixed
   */
  autoFixAll(result: ValidationResult): number {
    let fixed = 0;

    result.components.forEach(componentResult => {
      componentResult.issues.forEach(issue => {
        if (issue.canAutoFix && issue.autoFixFn) {
          try {
            issue.autoFixFn();
            fixed++;
          } catch (error) {
            console.error(`Auto-fix failed for ${issue.id}:`, error);
          }
        }
      });
    });

    return fixed;
  }

  /**
   * Auto-fix issues for specific component
   * 
   * @param componentId - Component ID
   * @param result - Validation result
   * @returns Number of issues fixed
   */
  autoFixComponent(componentId: string, result: ValidationResult): number {
    let fixed = 0;

    const componentResult = result.components.find(
      r => r.componentId === componentId
    );

    if (componentResult) {
      componentResult.issues.forEach(issue => {
        if (issue.canAutoFix && issue.autoFixFn) {
          try {
            issue.autoFixFn();
            fixed++;
          } catch (error) {
            console.error(`Auto-fix failed for ${issue.id}:`, error);
          }
        }
      });
    }

    return fixed;
  }
}

// Singleton instance
export const validator = new Validator();
