import type { LayoutConfig } from "@/lib/types/layout";

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validates a layout configuration against schema rules.
 * 
 * Validation rules:
 * - components: object with component records
 * - Each component must have: id (uuid), type (enum), position (x/y 0-1), size (w/h 0-1)
 * - version: string (semantic version format)
 * - metadata: optional with createdAt (ISO datetime), createdBy (optional)
 * - Rejects layouts > 1MB
 * - All positions/sizes must be 0.0-1.0 normalized
 * 
 * @param data - Unknown input to validate
 * @returns Valid LayoutConfig object
 * @throws ValidationError if validation fails
 */
export function validateLayout(data: unknown): LayoutConfig {
  const errors: Record<string, string[]> = {};

  // Type check
  if (!data || typeof data !== "object") {
    throw new ValidationError("Layout must be an object");
  }

  const obj = data as Record<string, unknown>;

  // Check size (1MB limit)
  const jsonStr = JSON.stringify(obj);
  const sizeBytes = new Blob([jsonStr]).size;
  if (sizeBytes > 1024 * 1024) {
    errors.size = ["Layout exceeds 1MB size limit"];
  }

  // Validate version
  if (typeof obj.version !== "string" || !isSemanticVersion(obj.version)) {
    errors.version = ["Version must be a semantic version string (e.g., '1.0.0')"];
  }

  // Validate components
  if (!obj.components || typeof obj.components !== "object") {
    errors.components = ["Components must be an object"];
  } else {
    const componentErrors = validateComponents(obj.components as Record<string, unknown>);
    if (Object.keys(componentErrors).length > 0) {
      errors.components = [JSON.stringify(componentErrors)];
    }
  }

  // Validate metadata if present
  if (obj.metadata !== undefined) {
    if (typeof obj.metadata !== "object" || obj.metadata === null) {
      errors.metadata = ["Metadata must be an object"];
    } else {
      const metadataErrors = validateMetadata(obj.metadata as Record<string, unknown>);
      if (Object.keys(metadataErrors).length > 0) {
        errors.metadata = [JSON.stringify(metadataErrors)];
      }
    }
  }

  // If there are errors, throw
  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Layout validation failed", errors);
  }

  return obj as unknown as LayoutConfig;
}

/**
 * Validates semantic version format (X.Y.Z)
 */
function isSemanticVersion(version: string): boolean {
  const semverRegex = /^\d+\.\d+\.\d+$/;
  return semverRegex.test(version);
}

/**
 * Validates components object
 */
function validateComponents(components: Record<string, unknown>): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  if (typeof components !== "object" || components === null) {
    return { components: ["Must be an object"] };
  }

  for (const [componentId, component] of Object.entries(components)) {
    if (!component || typeof component !== "object") {
      errors[componentId] = ["Component must be an object"];
      continue;
    }

    const comp = component as Record<string, unknown>;
    const compErrors: string[] = [];

    // Validate id
    if (!isValidUuid(comp.id as string)) {
      compErrors.push("id must be a valid UUID");
    }

    // Validate type
    const validTypes = ["button", "display", "indicator", "status"];
    if (!validTypes.includes(comp.type as string)) {
      compErrors.push(`type must be one of: ${validTypes.join(", ")}`);
    }

    // Validate position
    if (!comp.position || typeof comp.position !== "object") {
      compErrors.push("position must be an object with x and y");
    } else {
      const pos = comp.position as Record<string, unknown>;
      if (!isNormalizedNumber(pos.x as number)) {
        compErrors.push("position.x must be a number between 0.0 and 1.0");
      }
      if (!isNormalizedNumber(pos.y as number)) {
        compErrors.push("position.y must be a number between 0.0 and 1.0");
      }
    }

    // Validate size
    if (!comp.size || typeof comp.size !== "object") {
      compErrors.push("size must be an object with width and height");
    } else {
      const size = comp.size as Record<string, unknown>;
      if (!isNormalizedNumber(size.width as number)) {
        compErrors.push("size.width must be a number between 0.0 and 1.0");
      }
      if (!isNormalizedNumber(size.height as number)) {
        compErrors.push("size.height must be a number between 0.0 and 1.0");
      }
    }

    // properties is optional, just ensure it's an object if present
    if (comp.properties !== undefined && typeof comp.properties !== "object") {
      compErrors.push("properties must be an object if provided");
    }

    if (compErrors.length > 0) {
      errors[componentId] = compErrors;
    }
  }

  return errors;
}

/**
 * Validates metadata object
 */
function validateMetadata(metadata: Record<string, unknown>): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  // createdAt is optional but if present must be ISO date
  if (metadata.createdAt !== undefined) {
    if (typeof metadata.createdAt !== "string" || !isValidIsoDate(metadata.createdAt)) {
      errors.createdAt = ["createdAt must be a valid ISO 8601 date string"];
    }
  }

  // createdBy is optional, just check type
  if (metadata.createdBy !== undefined && typeof metadata.createdBy !== "string") {
    errors.createdBy = ["createdBy must be a string"];
  }

  return errors;
}

/**
 * Checks if a value is a normalized number (0.0-1.0)
 */
function isNormalizedNumber(value: unknown): boolean {
  return typeof value === "number" && value >= 0 && value <= 1;
}

/**
 * Checks if a string is a valid UUID v4
 */
function isValidUuid(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Checks if a string is a valid ISO 8601 date
 */
function isValidIsoDate(value: unknown): boolean {
  if (typeof value !== "string") return false;
  try {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime()) && value === date.toISOString();
  } catch {
    return false;
  }
}
