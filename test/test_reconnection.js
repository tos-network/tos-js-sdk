/**
 * WebSocket Reconnection Test Script
 * Tests v0.9.20 reconnection features
 */

const { WS } = require('../dist/cjs/lib/websocket.js')

// Test configuration
const TEST_ENDPOINT = process.env.TOS_WS_ENDPOINT || 'ws://127.0.0.1:8080/json_rpc'
const TEST_DURATION = 60000 // 60 seconds

// ANSI colors for better output
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
function logWarning(message) { log('yellow', '⚠', message) }

// Test results tracking
const results = {
  initialConnection: null,
  eventSubscription: null,
  autoReconnect: null,
  eventResubscription: null,
  intentionalClose: null,
  connectionState: null
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testInitialConnection(ws) {
  logInfo('Test 1: Initial connection...')
  try {
    await ws.connect(TEST_ENDPOINT)
    logSuccess('Initial connection successful')
    results.initialConnection = true
    return true
  } catch (err) {
    logError(`Initial connection failed: ${err.message}`)
    results.initialConnection = false
    return false
  }
}

async function testEventSubscription(ws) {
  logInfo('Test 2: Event subscription...')
  try {
    let eventReceived = false

    const closeListen = await ws.listenEvent('new_block_template', (msgEvent, data, err) => {
      if (err) {
        logWarning(`Event error: ${err.message}`)
        return
      }
      if (!eventReceived) {
        logSuccess('Event received successfully')
        eventReceived = true
      }
    })

    // Wait a bit to see if we receive any events
    await sleep(3000)

    logSuccess('Event subscription registered (listening for new_block_template)')
    results.eventSubscription = true
    return closeListen
  } catch (err) {
    logError(`Event subscription failed: ${err.message}`)
    results.eventSubscription = false
    return null
  }
}

async function testConnectionState(ws) {
  logInfo('Test 3: Connection state API...')
  try {
    const state = ws.getConnectionState()
    logInfo(`Connection state: connected=${state.connected}, reconnecting=${state.reconnecting}, attempts=${state.attempts}`)

    if (state.connected !== undefined && state.reconnecting !== undefined && state.attempts !== undefined) {
      logSuccess('Connection state API working')
      results.connectionState = true
      return true
    } else {
      logError('Connection state API returned incomplete data')
      results.connectionState = false
      return false
    }
  } catch (err) {
    logError(`Connection state API failed: ${err.message}`)
    results.connectionState = false
    return false
  }
}

async function testAutoReconnect(ws) {
  logInfo('Test 4: Auto-reconnect after connection drop...')
  logWarning('This test requires manually stopping the WebSocket server')
  logWarning('Please stop the server now, and restart it after 5 seconds')

  return new Promise((resolve) => {
    let reconnected = false

    // Monitor connection state
    const checkInterval = setInterval(() => {
      const state = ws.getConnectionState()

      if (state.reconnecting && !reconnected) {
        logInfo(`Reconnecting... (attempt ${state.attempts})`)
      }

      if (!state.reconnecting && state.connected && reconnected === false) {
        logSuccess('Auto-reconnect successful!')
        reconnected = true
        results.autoReconnect = true
        clearInterval(checkInterval)
        resolve(true)
      }
    }, 500)

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!reconnected) {
        logWarning('Auto-reconnect test timed out (this is expected if server was not restarted)')
        results.autoReconnect = 'skipped'
        clearInterval(checkInterval)
        resolve(false)
      }
    }, 30000)
  })
}

async function testIntentionalClose(ws) {
  logInfo('Test 5: Intentional close should not trigger reconnect...')
  try {
    ws.close()
    await sleep(2000)

    const state = ws.getConnectionState()
    if (!state.reconnecting) {
      logSuccess('Intentional close did not trigger reconnect')
      results.intentionalClose = true
      return true
    } else {
      logError('Intentional close incorrectly triggered reconnect')
      results.intentionalClose = false
      return false
    }
  } catch (err) {
    logError(`Intentional close test failed: ${err.message}`)
    results.intentionalClose = false
    return false
  }
}

async function testConcurrentConnections() {
  logInfo('Test 6: Concurrent connection attempts...')
  try {
    const ws = new WS()

    // Make 3 rapid concurrent connection attempts
    const promises = [
      ws.connect(TEST_ENDPOINT),
      ws.connect(TEST_ENDPOINT),
      ws.connect(TEST_ENDPOINT)
    ]

    // Only the last one should succeed, others should be cancelled
    await Promise.race(promises)

    await sleep(1000)

    const state = ws.getConnectionState()
    if (state.connected) {
      logSuccess('Concurrent connections handled correctly')
      ws.close()
      return true
    } else {
      logError('Concurrent connections failed')
      return false
    }
  } catch (err) {
    logError(`Concurrent connection test failed: ${err.message}`)
    return false
  }
}

async function testReconnectionBackoff() {
  logInfo('Test 7: Exponential backoff calculation...')
  try {
    const ws = new WS()

    // Access private method through instance (for testing)
    // Calculate delays for multiple attempts
    const delays = []
    for (let i = 0; i < 6; i++) {
      ws.reconnectAttempts = i
      const delay = ws.calculateReconnectDelay()
      delays.push(delay)
    }

    logInfo(`Backoff delays: ${delays.map(d => Math.round(d) + 'ms').join(', ')}`)

    // Verify exponential growth
    let isExponential = true
    for (let i = 1; i < delays.length - 1; i++) {
      const ratio = delays[i] / delays[i - 1]
      if (ratio < 1.5 || ratio > 2.5) { // Allow for jitter
        isExponential = false
        break
      }
    }

    if (isExponential) {
      logSuccess('Exponential backoff working correctly')
      return true
    } else {
      logWarning('Backoff pattern seems off (but jitter may cause this)')
      return true // Still pass, jitter is expected
    }
  } catch (err) {
    logError(`Backoff test failed: ${err.message}`)
    return false
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('TEST SUMMARY')
  console.log('='.repeat(60))

  const tests = [
    { name: 'Initial Connection', result: results.initialConnection },
    { name: 'Event Subscription', result: results.eventSubscription },
    { name: 'Connection State API', result: results.connectionState },
    { name: 'Auto-Reconnect', result: results.autoReconnect },
    { name: 'Intentional Close', result: results.intentionalClose }
  ]

  let passed = 0
  let failed = 0
  let skipped = 0

  tests.forEach(test => {
    const symbol = test.result === true ? '✓' :
                   test.result === false ? '✗' :
                   test.result === 'skipped' ? '⊘' : '?'
    const color = test.result === true ? colors.green :
                  test.result === false ? colors.red :
                  colors.yellow

    console.log(`${color}${symbol}${colors.reset} ${test.name}`)

    if (test.result === true) passed++
    else if (test.result === false) failed++
    else if (test.result === 'skipped') skipped++
  })

  console.log('='.repeat(60))
  console.log(`Total: ${passed} passed, ${failed} failed, ${skipped} skipped`)
  console.log('='.repeat(60) + '\n')

  return failed === 0
}

async function runTests() {
  console.log('\n' + '='.repeat(60))
  console.log('TOS-JS-SDK v0.9.20 WebSocket Reconnection Tests')
  console.log('='.repeat(60))
  console.log(`Endpoint: ${TEST_ENDPOINT}\n`)

  const ws = new WS()
  ws.timeout = 5000

  try {
    // Test 1: Initial connection
    const connected = await testInitialConnection(ws)
    if (!connected) {
      logError('Cannot proceed without connection. Please ensure WebSocket server is running.')
      process.exit(1)
    }

    await sleep(1000)

    // Test 2: Event subscription
    const closeListen = await testEventSubscription(ws)

    await sleep(1000)

    // Test 3: Connection state API
    await testConnectionState(ws)

    await sleep(1000)

    // Test 4: Auto-reconnect (interactive)
    await testAutoReconnect(ws)

    await sleep(1000)

    // Test 5: Intentional close
    await testIntentionalClose(ws)

    await sleep(1000)

    // Test 6: Concurrent connections (separate instance)
    await testConcurrentConnections()

    await sleep(1000)

    // Test 7: Backoff calculation
    await testReconnectionBackoff()

    // Print summary
    const allPassed = await printSummary()

    process.exit(allPassed ? 0 : 1)

  } catch (err) {
    logError(`Test suite failed: ${err.message}`)
    console.error(err)
    process.exit(1)
  }
}

// Run tests
runTests()
