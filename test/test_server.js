/**
 * Mock WebSocket Server for Testing
 * Simulates TOS node WebSocket behavior
 */

const WebSocket = require('ws')

const PORT = 8080
const wss = new WebSocket.Server({ port: PORT })

let messageId = 0
const subscriptions = new Map()

console.log(`Mock WebSocket server listening on ws://127.0.0.1:${PORT}/json_rpc`)

wss.on('connection', (ws) => {
  console.log('Client connected')

  // Send periodic block template updates
  const blockInterval = setInterval(() => {
    subscriptions.forEach((subId, event) => {
      if (event === 'new_block_template') {
        const notification = {
          jsonrpc: '2.0',
          id: subId,
          result: {
            height: Math.floor(Math.random() * 100000),
            timestamp: Date.now(),
            difficulty: '1000000'
          }
        }
        try {
          ws.send(JSON.stringify(notification))
        } catch (err) {
          // Client disconnected
        }
      }
    })
  }, 5000)

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      console.log('Received:', message.method || message)

      // Handle subscribe
      if (message.method === 'subscribe') {
        const id = messageId++
        const event = message.params?.notify
        if (event) {
          subscriptions.set(event, id)
          console.log(`Subscribed to ${event} with id ${id}`)
        }

        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id: message.id,
          result: true
        }))
      }

      // Handle unsubscribe
      else if (message.method === 'unsubscribe') {
        const event = message.params?.notify
        if (event) {
          subscriptions.delete(event)
          console.log(`Unsubscribed from ${event}`)
        }

        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id: message.id,
          result: true
        }))
      }

      // Handle get_info
      else if (message.method === 'get_info') {
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id: message.id,
          result: {
            height: 123456,
            topoheight: 123456,
            stableheight: 123450,
            version: '0.9.0',
            network: 'testnet'
          }
        }))
      }

      // Echo other methods
      else {
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id: message.id,
          result: { success: true }
        }))
      }
    } catch (err) {
      console.error('Error processing message:', err.message)
    }
  })

  ws.on('close', () => {
    clearInterval(blockInterval)
    subscriptions.clear()
    console.log('Client disconnected')
  })

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message)
  })
})

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...')
  wss.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

console.log('Server ready. Press Ctrl+C to stop.')
console.log('You can now run: node test_reconnection.js')
