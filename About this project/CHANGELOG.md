# CHANGELOG

## [Unreleased]

### Added
- **Dynamic Session Configuration**: Full support for custom number of phases per session
- **Dual Elimination Rules**: 
  - Target-based elimination (custom token thresholds, revivable ranges)
  - Percentage-based elimination (custom bottom % elimination per phase)
- **Custom Phase Durations**: Each phase can have its own duration (total session duration calculated automatically)
- **Phase Start Announcements**: Automated live feed announcements when each phase begins, showing the elimination rule
- **Backward Compatibility**: Auto-conversion from old phase config format to new dynamic format

### Changed
- Renamed `classifyPhase1` → `classifyTargetElimination` for clarity
- Added `PhaseEntry`, `EliminationRuleType`, `TargetEliminationConfig`, `PercentageEliminationConfig` types
- Updated phase timing utilities to support dynamic configurations
- Updated session orchestrator to handle arbitrary phase counts
- Updated test suite for new function names

### Database
- Migration 004: Updated `phase_config` default to new array format and added conversion function
