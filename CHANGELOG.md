# Changelog

All notable changes to this project will be documented in this file.

## [0.9.20] - 2025-10-20

### Fixed

**Critical Bug Fixes #8, #9, #10**: Fixed 3 blocker/high priority WebSocket reconnection bugs

#### Bug #8 (Blocker): Runtime Disconnect Detection
- **Issue**: Close handler was removed after WebSocket opened, making runtime disconnects invisible
- **Fix**: Keep close handler active after successful connection
- **Result**: Runtime disconnects now properly detected and trigger auto-reconnection

#### Bug #9 (Blocker): Auto-Reconnect Handshake Failures
- **Issue**: Auto-reconnect hung permanently after first handshake failure
- **Fix**: Use per-socket `socketOpened` flag to track individual socket state
- **Result**: Handshake failures properly handled with automatic retry

#### Bug #10 (High): Old Socket State Pollution
- **Issue**: Old socket close events polluted new connection state
- **Fix**: Only reset connection flags if new socket hasn't opened yet
- **Result**: Socket state properly isolated, no cross-contamination

### Improved

**Enhanced Error Handling**:
- Added Promise settlement guards to prevent multiple resolve/reject
- Added duplicate reconnection scheduling prevention
- Improved error handler to only reject on handshake failures
- Enhanced reconnection control with force parameter

**Code Quality**:
- Removed unnecessary console logs for cleaner production output
- Optimized jitter calculation (0% to +25%)
- Better separation of concerns in close/error handlers

### Added

- New test file `test/test_bug_fixes.js` for bug validation
- Tests for runtime disconnect detection
- Tests for socket state isolation

### Breaking Changes

None. Fully backward compatible.

---

## [0.9.19] - 2025-10-20

### Added

**WebSocket Reconnection System**: Implemented robust auto-reconnection

- Automatic reconnection with exponential backoff (1s → 30s max)
- Automatic event subscription restoration
- Connection state API (`getConnectionState()`)
- Infinite retry attempts (configurable)

### Fixed

- Bug #1-#7: Event preservation, flag races, error handling, closure traps, state management

---

## [0.9.18] - 2025-10-17

### Breaking Changes

#### API Method and Property Names Updated to Match Daemon GHOSTDAG Consensus

The SDK has been updated to align with GHOSTDAG consensus terminology. **This release contains breaking changes that require code updates.**

**Method Name Changes:**
- `getHeight()` → `getBlueScore()`
- `getStableHeight()` → `getStableBlueScore()`
- `getBlocksAtHeight(params)` → `getBlocksAtBlueScore(params)`
- `getBlocksRangeByHeight(params)` → `getBlocksRangeByBlueScore(params)`

**Parameter Name Changes:**
- `{ height: number }` → `{ blue_score: number }`
- `{ start_height, end_height }` → `{ start_blue_score, end_blue_score }`

**GetInfoResult Property Changes:**
- `info.height` → `info.blue_score`
- `info.stableheight` → `info.stable_blue_score`

### Migration Guide

**Code changes ARE required to upgrade to v0.9.18.**

Update your code from:

```typescript
// Old (v0.9.17 and earlier):
const height = await daemon.getHeight()
const stableHeight = await daemon.getStableHeight()
const blocks = await daemon.getBlocksAtHeight({ height: 1000 })
const blocksRange = await daemon.getBlocksRangeByHeight({ start_height: 100, end_height: 200 })

const info = await daemon.getInfo()
console.log(info.height, info.stableheight)
```

To:

```typescript
// New (v0.9.18+):
const blueScore = await daemon.getBlueScore()
const stableBlueScore = await daemon.getStableBlueScore()
const blocks = await daemon.getBlocksAtBlueScore({ blue_score: 1000 })
const blocksRange = await daemon.getBlocksRangeByBlueScore({ start_blue_score: 100, end_blue_score: 200 })

const info = await daemon.getInfo()
console.log(info.blue_score, info.stable_blue_score)
```

### Technical Details

**GHOSTDAG Consensus Context:**

TOS uses GHOSTDAG consensus, which is a DAG-based consensus mechanism. Key concepts:

- **blue_score**: The number of blue blocks in the DAG's past set (represents DAG depth)
- **topoheight**: Topological ordering index (continuous: 0, 1, 2, 3...)
- **Traditional height**: Not used in GHOSTDAG; replaced by blue_score

The SDK now uses the correct GHOSTDAG terminology throughout the API.

---

## [0.9.17] - Previous Release

(Previous changelog entries...)
