/**
 * Performance Module — Public API
 */
export { performanceMonitor, FRAME_BUDGET_MS, SUBSYSTEM_BUDGETS, MEMORY_BUDGETS_MB } from "./budget";
export type { SubsystemName, MemoryCategory } from "./budget";

export { assetPreloader, ASSET_MANIFEST } from "./assetPreloader";
export type { AssetEntry, AssetStage, AssetType } from "./assetPreloader";

export { failsafe } from "./failsafe";
export type { FailureCategory, FailureSeverity, FailureRecord } from "./failsafe";
