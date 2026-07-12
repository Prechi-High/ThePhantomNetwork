/**
 * Config Module — Public API
 */
export { featureFlags, FF }                                              from "./featureFlags";
export type { FeatureFlags }                                             from "./featureFlags";
export { LAUNCH_CHECKLIST, runAutomatedChecks, isReadyToLaunch, getSummary, getBlockingFailures } from "./launchChecklist";
export type { ChecklistItem }                                            from "./launchChecklist";
