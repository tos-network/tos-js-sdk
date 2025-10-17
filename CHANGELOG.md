# Changelog

All notable changes to this project will be documented in this file.

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
