# WebSocket Reconnection Tests

This directory contains tests for the WebSocket reconnection system implemented in v0.9.20.

## Files

- **test_server.js** - Mock WebSocket server that simulates TOS node behavior
- **test_reconnection.js** - Comprehensive test suite for reconnection features

## Running Tests

### Option 1: With Mock Server (Recommended)

Start the mock server in one terminal:
```bash
npm run test:ws:server
```

Then run the tests in another terminal:
```bash
npm run test:ws
```

### Option 2: Against Real TOS Node

If you have a TOS node running, you can test against it:
```bash
TOS_WS_ENDPOINT=ws://your-node:8080/json_rpc npm run test:ws
```

### Option 3: Manual Commands

```bash
# Start mock server
node test/test_server.js

# Run tests (in another terminal)
node test/test_reconnection.js
```

## Test Coverage

The test suite verifies:

1. ✅ **Initial Connection** - Successful WebSocket connection establishment
2. ✅ **Event Subscription** - Subscribe to events and receive notifications
3. ✅ **Connection State API** - `getConnectionState()` returns correct status
4. ✅ **Auto-Reconnect** - Automatic reconnection after connection drop
5. ✅ **Intentional Close** - Manual close does not trigger reconnection
6. ✅ **Concurrent Connections** - Multiple concurrent connect calls are handled correctly
7. ✅ **Exponential Backoff** - Reconnection delays increase exponentially with jitter

## Expected Output

```
============================================================
TOS-JS-SDK v0.9.20 WebSocket Reconnection Tests
============================================================
Endpoint: ws://127.0.0.1:8080/json_rpc

✓ Test 1: Initial connection...
✓ Test 2: Event subscription...
✓ Test 3: Connection state API...
✓ Test 4: Auto-reconnect after connection drop...
✓ Test 5: Intentional close should not trigger reconnect...
✓ Test 6: Concurrent connection attempts...
✓ Test 7: Exponential backoff calculation...

============================================================
TEST SUMMARY
============================================================
✓ Initial Connection
✓ Event Subscription
✓ Connection State API
✓ Auto-Reconnect
✓ Intentional Close
============================================================
Total: 5 passed, 0 failed, 0 skipped
============================================================
```

## Configuration

### Test Endpoint

Default: `ws://127.0.0.1:8080/json_rpc`

Override with environment variable:
```bash
TOS_WS_ENDPOINT=ws://custom:8080/json_rpc npm run test:ws
```

### Test Duration

The full test suite runs for approximately 13 seconds.

## Interactive Tests

**Test 4 (Auto-Reconnect)** includes an interactive component:
- The test will prompt you to stop and restart the WebSocket server
- This demonstrates automatic reconnection in action
- If using the mock server, you can skip this by letting it timeout

## Mock Server Features

The mock server (`test_server.js`) simulates a TOS node:

- **Port**: 8080
- **Endpoint**: `/json_rpc`
- **Methods supported**:
  - `subscribe` - Subscribe to events
  - `unsubscribe` - Unsubscribe from events
  - `get_info` - Get node information
  - Generic methods - Echo success response
- **Events**:
  - `new_block_template` - Emitted every 5 seconds with mock data

## Troubleshooting

### Error: Connection Refused

If you see `ECONNREFUSED`, make sure the WebSocket server is running:
```bash
npm run test:ws:server
```

### Port Already in Use

If port 8080 is busy, the mock server will fail to start. Stop any other services using that port.

### Tests Timeout

If tests hang, ensure:
1. The WebSocket server is accessible
2. No firewall is blocking connections
3. The endpoint URL is correct

## NPM Publishing

These test files are **not included in npm packages**. The `package.json` `files` field only includes the `dist/` directory.

To verify what will be published:
```bash
npm pack --dry-run
```

## Related Documentation

- [WEBSOCKET_RECONNECTION_IMPLEMENTATION.md](../memo/WEBSOCKET_RECONNECTION_IMPLEMENTATION.md) - Implementation guide
- [WEBSOCKET_RECONNECTION_FINAL.md](../memo/WEBSOCKET_RECONNECTION_FINAL.md) - Design and bug fixes
- [WEBSOCKET_ANALYSIS.md](../memo/WEBSOCKET_ANALYSIS.md) - Initial problem analysis

## Bug Reports

If tests fail, please report issues with:
- Test output (all colored logs)
- Node version (`node --version`)
- Platform (macOS, Linux, Windows)
- Whether using mock server or real node
