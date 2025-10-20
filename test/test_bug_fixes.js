/**
 * Test suite for Bug Fixes #8, #9, #10
 * Tests edge cases and regression scenarios
 */

const { WS } = require('../dist/cjs/lib/websocket.js')
const WebSocket = require('ws')

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(color, prefix, message) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
  console.log(`${colors[color]}[${timestamp}] ${prefix}${colors.reset} ${message}`)
}

function logSuccess(message) { log('green', '✓', message) }
function logError(message) { log('red', '✗', message) }
function logInfo(message) { log('blue', 'ℹ', message) }

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Create a mock server that can be controlled
class ControlledMockServer {
  constructor(port = 8081) {
    this.port = port
    this.wss = null
    this.clients = []
  }

  start() {
    return new Promise((resolve) => {
      this.wss = new WebSocket.Server({ port: this.port })

      this.wss.on('connection', (ws) => {
        this.clients.push(ws)

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString())

            // Echo success for any method
            ws.send(JSON.stringify({
              jsonrpc: '2.0',
              id: message.id,
              result: true
            }))
          } catch (err) {
            // Ignore
          }
        })
      })

      this.wss.on('listening', resolve)
    })
  }

  stop() {
    return new Promise((resolve) => {
      // Close all clients
      this.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.close()
        }
      })
      this.clients = []

      if (this.wss) {
        this.wss.close(resolve)
      } else {
        resolve()
      }
    })
  }

  dropAllConnections() {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.terminate()  // Abrupt close without handshake
      }
    })
    this.clients = []
  }
}

// Test Bug #8: Close handler remains active after open
async function testBug8_RuntimeDisconnectDetection() {
  logInfo('Bug #8: Testing runtime disconnect detection...')

  const server = new ControlledMockServer(8081)
  await server.start()

  const ws = new WS()
  ws.reconnectOnConnectionLoss = true
  ws.maxConnectionTries = 3

  try {
    // Initial connection
    await ws.connect('ws://127.0.0.1:8081/json_rpc')
    logSuccess('Initial connection established')

    await sleep(500)

    // Now simulate server dropping the connection AFTER successful open
    logInfo('Simulating runtime disconnect...')
    let reconnectDetected = false

    // Monitor for reconnect
    const checkInterval = setInterval(() => {
      const state = ws.getConnectionState()
      if (state.reconnecting) {
        reconnectDetected = true
        logSuccess('Reconnect was triggered (close handler still active)')
        clearInterval(checkInterval)
      }
    }, 100)

    // Drop the connection
    server.dropAllConnections()

    // Wait to see if reconnect is triggered
    await sleep(2000)
    clearInterval(checkInterval)

    await server.stop()

    if (reconnectDetected) {
      logSuccess('Bug #8 FIX VERIFIED: Runtime disconnect detected and reconnect triggered')
      return true
    } else {
      logError('Bug #8 REGRESSION: Runtime disconnect not detected (close handler removed)')
      return false
    }
  } catch (err) {
    logError(`Bug #8 test failed: ${err.message}`)
    await server.stop()
    return false
  }
}

// Test Bug #9: Auto-reconnect handshake failure doesn't hang
async function testBug9_HandshakeFailureRetry() {
  logInfo('Bug #9: Testing auto-reconnect handshake failure retry...')

  const server = new ControlledMockServer(8082)
  await server.start()

  const ws = new WS()
  ws.reconnectOnConnectionLoss = true
  ws.baseReconnectDelay = 500  // Fast retries for testing
  ws.maxConnectionTries = -1

  try {
    // Initial connection
    await ws.connect('ws://127.0.0.1:8082/json_rpc')
    logSuccess('Initial connection established')

    await sleep(500)

    // Stop server to simulate disconnect
    logInfo('Stopping server to trigger auto-reconnect...')
    await server.stop()

    await sleep(1000)

    // Start rejecting connections immediately (handshake failures)
    logInfo('Server will reject handshakes for first 2 attempts...')

    let attemptCount = 0
    let serverRestarted = false

    // Monitor reconnection attempts
    const monitor = setInterval(() => {
      const state = ws.getConnectionState()

      if (state.reconnecting && !serverRestarted) {
        attemptCount = state.attempts

        // After 2 failed attempts, restart server
        if (attemptCount >= 2 && !serverRestarted) {
          serverRestarted = true
          logInfo('Restarting server after 2 failed handshakes...')
          server.start().then(() => {
            logSuccess('Server restarted, next attempt should succeed')
          })
        }
      }

      if (state.connected && serverRestarted) {
        logSuccess(`Bug #9 FIX VERIFIED: Reconnected after ${attemptCount} handshake failures`)
        clearInterval(monitor)
      }
    }, 200)

    // Wait for reconnection
    await sleep(10000)
    clearInterval(monitor)

    const finalState = ws.getConnectionState()
    await server.stop()

    if (finalState.connected && attemptCount >= 2) {
      logSuccess('Bug #9 FIX VERIFIED: Auto-reconnect survived multiple handshake failures')
      return true
    } else {
      logError(`Bug #9 REGRESSION: Did not reconnect after handshake failures (attempts: ${attemptCount}, connected: ${finalState.connected})`)
      return false
    }
  } catch (err) {
    logError(`Bug #9 test failed: ${err.message}`)
    await server.stop()
    return false
  }
}

// Test Bug #10: Old socket close doesn't pollute new connection state
async function testBug10_OldSocketPollution() {
  logInfo('Bug #10: Testing old socket close event isolation...')

  const server = new ControlledMockServer(8083)
  await server.start()

  const ws = new WS()
  ws.reconnectOnConnectionLoss = true

  try {
    // First connection
    await ws.connect('ws://127.0.0.1:8083/json_rpc')
    logSuccess('First connection established')

    // Capture the first socket
    const oldSocket = ws.socket

    await sleep(200)

    // Initiate manual reconnect (should reset hasConnectedOnce when old socket closes)
    logInfo('Initiating manual reconnect...')
    const reconnectPromise = ws.connect('ws://127.0.0.1:8083/json_rpc')

    // New connection should establish quickly
    await reconnectPromise
    logSuccess('New connection established')

    // Verify new connection is active
    const state = ws.getConnectionState()

    if (state.connected) {
      logSuccess('New connection active before old socket close event')
    }

    // Now the old socket will close (with delay)
    // This should NOT affect the new connection's hasConnectedOnce flag

    await sleep(500)

    // Simulate disconnect on the NEW connection
    logInfo('Simulating disconnect on NEW connection...')
    server.dropAllConnections()

    await sleep(1000)

    // Check if reconnect was triggered (it should be, because hasConnectedOnce should still be true)
    const reconnectState = ws.getConnectionState()

    await server.stop()

    if (reconnectState.reconnecting) {
      logSuccess('Bug #10 FIX VERIFIED: Old socket close did not pollute new connection state')
      return true
    } else {
      logError('Bug #10 REGRESSION: New connection state was polluted by old socket close')
      return false
    }
  } catch (err) {
    logError(`Bug #10 test failed: ${err.message}`)
    await server.stop()
    return false
  }
}

async function runBugFixTests() {
  console.log('\n' + '='.repeat(60))
  console.log('WebSocket Bug Fix Verification Tests')
  console.log('Testing Bug #8, #9, #10 Fixes')
  console.log('='.repeat(60) + '\n')

  const results = {
    bug8: null,
    bug9: null,
    bug10: null
  }

  // Test Bug #8
  results.bug8 = await testBug8_RuntimeDisconnectDetection()
  await sleep(1000)

  // Test Bug #9
  results.bug9 = await testBug9_HandshakeFailureRetry()
  await sleep(1000)

  // Test Bug #10
  results.bug10 = await testBug10_OldSocketPollution()
  await sleep(1000)

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('TEST SUMMARY')
  console.log('='.repeat(60))

  const tests = [
    { name: 'Bug #8: Runtime Disconnect Detection', result: results.bug8 },
    { name: 'Bug #9: Handshake Failure Retry', result: results.bug9 },
    { name: 'Bug #10: Old Socket Isolation', result: results.bug10 }
  ]

  let passed = 0
  let failed = 0

  tests.forEach(test => {
    const symbol = test.result ? '✓' : '✗'
    const color = test.result ? colors.green : colors.red

    console.log(`${color}${symbol}${colors.reset} ${test.name}`)

    if (test.result) passed++
    else failed++
  })

  console.log('='.repeat(60))
  console.log(`Total: ${passed} passed, ${failed} failed`)
  console.log('='.repeat(60) + '\n')

  process.exit(failed === 0 ? 0 : 1)
}

runBugFixTests()
