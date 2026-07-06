/**
 * AlignmentEngine - Main alignment coordinator
 * 
 * Orchestrates alignment, distribution, and size matching operations.
 */

import type { ComponentInstance } from '../state/slices/componentsSlice';
import type {
  AlignmentType,
  DistributionType,
  SizeMatchType,
  BatchAlignmentResult,
} from './types';
import {
  alignComponents,
  distributeComponents,
  matchSize,
} from './operations';

export class AlignmentEngine {
  /**
   * Align multiple components
   * 
   * @param components - Components to align
   * @param alignType - Type of alignment
   * @returns Batch alignment result
   */
  static align(
    components: ComponentInstance[],
    alignType: AlignmentType
  ): BatchAlignmentResult {
    if (components.length < 2) {
      return {
        results: [],
        description: 'Need at least 2 components to align',
      };
    }

    const results = alignComponents(components, alignType);

    const descriptions: Record<AlignmentType, string> = {
      'left': 'Align Left',
      'right': 'Align Right',
      'top': 'Align Top',
      'bottom': 'Align Bottom',
      'center-horizontal': 'Center Horizontally',
      'center-vertical': 'Center Vertically',
      'center-both': 'Center Both',
    };

    return {
      results,
      description: descriptions[alignType],
    };
  }

  /**
   * Distribute components evenly
   * 
   * @param components - Components to distribute
   * @param distributionType - Horizontal or vertical
   * @returns Batch alignment result
   */
  static distribute(
    components: ComponentInstance[],
    distributionType: DistributionType
  ): BatchAlignmentResult {
    if (components.length < 3) {
      return {
        results: [],
        description: 'Need at least 3 components to distribute',
      };
    }

    const results = distributeComponents(components, distributionType);

    const description = distributionType === 'horizontal'
      ? 'Distribute Horizontally'
      : 'Distribute Vertically';

    return {
      results,
      description,
    };
  }

  /**
   * Match size of components
   * 
   * @param components - Components to match
   * @param matchType - Width, height, or both
   * @param referenceComponent - Component to match (first if not specified)
   * @returns Batch alignment result
   */
  static matchSize(
    components: ComponentInstance[],
    matchType: SizeMatchType,
    referenceComponent?: ComponentInstance
  ): BatchAlignmentResult {
    if (components.length < 2) {
      return {
        results: [],
        description: 'Need at least 2 components to match size',
      };
    }

    const results = matchSize(components, matchType, referenceComponent);

    const descriptions: Record<SizeMatchType, string> = {
      'width': 'Match Width',
      'height': 'Match Height',
      'both': 'Match Size',
    };

    return {
      results,
      description: descriptions[matchType],
    };
  }

  /**
   * Get description for alignment operation
   */
  static getOperationDescription(
    operation: AlignmentType | DistributionType | SizeMatchType
  ): string {
    const descriptions: Record<string, string> = {
      'left': 'Align Left',
      'right': 'Align Right',
      'top': 'Align Top',
      'bottom': 'Align Bottom',
      'center-horizontal': 'Center Horizontally',
      'center-vertical': 'Center Vertically',
      'center-both': 'Center Both',
      'horizontal': 'Distribute Horizontally',
      'vertical': 'Distribute Vertically',
      'width': 'Match Width',
      'height': 'Match Height',
      'both': 'Match Size',
    };

    return descriptions[operation] || 'Unknown Operation';
  }
}
