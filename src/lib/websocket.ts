import { ClientOptions, MessageEvent } from 'ws'
import WebSocket from 'isomorphic-ws'
import { ClientRequestArgs } from 'http'
import { to } from 'await-to-js'

import { RPCRequest, RPCResponse } from './types'
import { parseData } from './parse_data'

interface EventData {
  id?: number
  listeners: ((msgEvent: MessageEvent) => void)[]
  unsubscribeTimeoutId?: any
}

export class WS {
  endpoint: string
  socket?: WebSocket
  timeout: number
  unsubscribeSuspense: number
  reconnectOnConnectionLoss: boolean
  maxConnectionTries: number
  options?: ClientOptions | ClientRequestArgs

  // Reconnection state
  private reconnectAttempts = 0
  private reconnectTimeoutId?: any
  private maxReconnectDelay = 30000  // 30 seconds
  private baseReconnectDelay = 1000  // 1 second
  private isAutoReconnecting = false
  private hasConnectedOnce = false
  private currentConnectionType: 'manual' | 'auto' = 'manual'

  connectionTries = 0
  methodIdIncrement = 0

  private events: Record<string, EventData>

  constructor(options?: ClientOptions | ClientRequestArgs) {
    this.endpoint = ""
    this.timeout = 15000 // default to 15s
    this.events = {}
    this.unsubscribeSuspense = 1000
    this.maxConnectionTries = -1  // -1 = infinite retries
    this.reconnectOnConnectionLoss = true
    this.options = options
  }

  connect(endpoint: string, isAutoReconnect: boolean = false): Promise<Event> {
    // Cancel any pending auto-reconnection
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId)
      this.reconnectTimeoutId = undefined
    }

    // Determine connection type
    this.currentConnectionType = isAutoReconnect ? 'auto' : 'manual'

    // Only reset events on endpoint change OR manual reconnect
    const isEndpointChange = this.endpoint !== endpoint
    const isManualReconnect = !isAutoReconnect && this.endpoint === endpoint

    if (isEndpointChange || isManualReconnect) {
      this.events = {}
    }

    // Capture old socket before overwriting
    const oldSocket = this.socket

    // Close existing connection if open
    if (oldSocket && oldSocket.readyState === WebSocket.OPEN) {
      // Temporarily disable auto-reconnect for intentional close
      const wasReconnectEnabled = this.reconnectOnConnectionLoss
      this.reconnectOnConnectionLoss = false

      oldSocket.close()

      // Re-enable after brief delay
      setTimeout(() => {
        this.reconnectOnConnectionLoss = wasReconnectEnabled
      }, 100)
    }

    this.connectionTries = 0
    this.endpoint = endpoint

    return new Promise((resolve, reject) => {
      // Bind resolvers to this socket's closure, not instance
      const resolvers = { resolve, reject }
      let isSettled = false
      const resolveOnce = (event: Event) => {
        if (isSettled) return
        isSettled = true
        resolvers.resolve(event)
      }
      const rejectOnce = (error: Error) => {
        if (isSettled) return false
        isSettled = true
        resolvers.reject(error)
        return true
      }

      // Capture socket in local variable
      const socket = new WebSocket(endpoint, this.options)
      this.socket = socket  // Update instance for other methods

      // Track if this socket should reset hasConnectedOnce
      const shouldResetConnectionFlag = isEndpointChange || isManualReconnect

      // FIX #9: Track if THIS specific socket ever opened (per-socket flag)
      let socketOpened = false
      let errorScheduledRetry = false

      // Setup handlers
      const openHandler = (event: Event) => {
        // FIX #9: Mark THIS socket as opened
        socketOpened = true

        // Only set hasConnectedOnce for this socket if it's current
        if (this.socket === socket) {
          this.hasConnectedOnce = true
        }

        this.reconnectAttempts = 0
        this.isAutoReconnecting = false

        // FIX #8: Only cleanup open and error handlers, keep close handler alive
        socket.removeEventListener('open', openHandler as any)
        socket.removeEventListener('error', errorHandler as any)

        resolveOnce(event)
      }

      const closeHandler = (event: CloseEvent) => {
        // Always cleanup this socket's handlers
        socket.removeEventListener('open', openHandler as any)
        socket.removeEventListener('close', closeHandler as any)
        socket.removeEventListener('error', errorHandler as any)

        // Only process this close if it's from the current socket
        if (this.socket !== socket) {
          // FIX #10: Only reset flag if new socket hasn't opened yet
          if (shouldResetConnectionFlag && !this.hasConnectedOnce) {
            this.hasConnectedOnce = false
          }
          return
        }

        // FIX #9: Use per-socket opened flag to decide behavior
        const shouldReject = !socketOpened  // THIS socket never opened
        const shouldAutoReconnect = socketOpened &&
                                    this.reconnectOnConnectionLoss &&
                                    !this.isAutoReconnecting

        if (shouldReject) {
          // This socket failed to open (handshake failure)
          const error = new Error(`Connection failed: ${event.reason || event.code}`)
          rejectOnce(error)

          const canRetry = isAutoReconnect && this.reconnectOnConnectionLoss

          if (canRetry && !errorScheduledRetry) {
            this.scheduleReconnect(true)
            errorScheduledRetry = true
          }

          if (!canRetry) {
            this.isAutoReconnecting = false  // No further retries
          }
        } else if (shouldAutoReconnect) {
          // Socket was opened but now dropped, schedule auto-reconnect
          this.scheduleReconnect()
        } else {
          // Intentional close or reconnect disabled
          this.isAutoReconnecting = false  // Ensure state is clean
        }
      }

      const errorHandler = (err: Event) => {
        console.error('WebSocket error', err)

        // Remove error handler to avoid repeated logs, leave close handler active
        socket.removeEventListener('error', errorHandler as any)
        socket.removeEventListener('open', openHandler as any)

        if (!socketOpened) {
          const error = new Error('WebSocket connection error')
          const rejectedHere = rejectOnce(error)

          if (rejectedHere && isAutoReconnect && this.reconnectOnConnectionLoss) {
            this.scheduleReconnect(true)
            errorScheduledRetry = true
          }
        }
      }

      // Register handlers on local socket
      socket.addEventListener('open', openHandler as any)
      socket.addEventListener('close', closeHandler as any)
      socket.addEventListener('error', errorHandler as any)
    })
  }

  // Calculate exponential backoff with jitter
  private calculateReconnectDelay(): number {
    const exponentialDelay = Math.min(
      this.maxReconnectDelay,
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts)
    )

    // Add jitter (0% - 25%)
    const jitter = exponentialDelay * 0.25 * Math.random()
    return exponentialDelay + jitter
  }

  // Schedule reconnection with exponential backoff
  private scheduleReconnect(force = false) {
    if (this.isAutoReconnecting && !force) return
    if (this.maxConnectionTries > 0 && this.reconnectAttempts >= this.maxConnectionTries) {
      console.error('Max reconnection attempts reached')
      return
    }

    if (force && this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId)
      this.reconnectTimeoutId = undefined
    }

    this.isAutoReconnecting = true
    const delay = this.calculateReconnectDelay()

    this.reconnectTimeoutId = setTimeout(async () => {
      this.reconnectTimeoutId = undefined
      this.reconnectAttempts++

      try {
        // This connect() call will NOT reset events (same endpoint, isAutoReconnect=true)
        await this.connect(this.endpoint, true)

        // Resubscribe to all events after successful reconnection
        await this.resubscribeAllEvents()

      } catch (err) {
        console.error('Reconnection failed', err)
        if (!this.reconnectTimeoutId) {
          // No further attempts scheduled (e.g., reconnect disabled)
          this.isAutoReconnecting = false
        }
        // Otherwise, close/error handlers will schedule the next attempt
      }
    }, delay)
  }

  // Resubscribe to all active events after reconnection
  private async resubscribeAllEvents() {
    const eventNames = Object.keys(this.events)
    for (const eventName of eventNames) {
      try {
        const res = await this.call<boolean>(`subscribe`, { notify: eventName })
        this.events[eventName].id = res.id

        // Reattach all listeners to the new socket
        const listeners = this.events[eventName].listeners
        for (const listener of listeners) {
          this.socket && this.socket.addEventListener(`message`, listener)
        }
      } catch (err) {
        console.error(`Failed to resubscribe to ${eventName}`, err)
      }
    }
  }

  close() {
    if (!this.socket) return

    // Cancel any pending reconnection
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId)
      this.reconnectTimeoutId = undefined
    }

    // Temporarily disable auto-reconnect to prevent this intentional close from triggering reconnection
    const wasReconnectEnabled = this.reconnectOnConnectionLoss
    this.reconnectOnConnectionLoss = false

    this.socket.close()

    // Re-enable after brief delay
    setTimeout(() => {
      this.reconnectOnConnectionLoss = wasReconnectEnabled
    }, 100)
  }

  // Get current connection state
  getConnectionState(): {
    connected: boolean
    reconnecting: boolean
    attempts: number
  } {
    return {
      connected: this.socket?.readyState === WebSocket.OPEN,
      reconnecting: this.isAutoReconnecting,
      attempts: this.reconnectAttempts
    }
  }

  private clearEvent(event: string) {
    this.events[event].listeners.forEach(listener => {
      this.socket && this.socket.removeEventListener(`message`, listener)
    })

    Reflect.deleteProperty(this.events, event)
  }

  async closeAllListens(event: string) {
    if (this.events[event]) {
      const [err, _] = await to(this.call<boolean>(`unsubscribe`, { notify: event }))
      if (err) return Promise.reject(err)
      this.clearEvent(event)
    }

    return Promise.resolve()
  }

  async listenEvent<T>(event: string, onData: (msgEvent: MessageEvent, data?: T, err?: Error) => void) {
    const onMessage = (msgEvent: MessageEvent) => {
      if (this.events[event]) {
        const { id } = this.events[event]
        if (typeof msgEvent.data === `string`) {
          try {
            const data = parseData(msgEvent.data) as RPCResponse<any>
            if (data.id === id) {
              if (data.error) {
                onData(msgEvent, undefined, new Error(data.error.message))
              } else {
                onData(msgEvent, data.result, undefined)
              }
            }
          } catch {
            // can't parse json -- do nothing
          }
        }
      }
    }

    if (this.events[event]) {
      const { unsubscribeTimeoutId } = this.events[event]
      if (unsubscribeTimeoutId) {
        // clear timeout to unsubscribe 
        // because we got a new registered event and want to cancel the pending unsubscribe grace period
        clearTimeout(unsubscribeTimeoutId)
      }

      this.events[event].listeners.push(onMessage)
    } else {
      // important if multiple listenEvent are called without await at least we store listener before getting id
      this.events[event] = { listeners: [onMessage] }
      const [err, res] = await to(this.call<boolean>(`subscribe`, { notify: event }))
      if (err) {
        this.clearEvent(event)
        return Promise.reject(err)
      }

      this.events[event].id = res.id
    }

    this.socket && this.socket.addEventListener(`message`, onMessage)

    const closeListen = () => {
      const eventData = this.events[event]
      if (eventData) {
        const listeners = eventData.listeners
        for (let i = 0; i < listeners.length; i++) {
          if (listeners[i] === onMessage) {
            listeners.splice(i, 1)
            break
          }
        }

        // no more listener so we unsubscribe from daemon websocket if socket still open
        if (listeners.length === 0) {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            // we use a grace period to unsubscribe (mostly because of react useEffect and avoid unecessary subscribe)
            this.events[event].unsubscribeTimeoutId = setTimeout(async () => {
              this.call<boolean>(`unsubscribe`, { notify: event })
              Reflect.deleteProperty(this.events, event)
            }, this.unsubscribeSuspense)
          } else {
            // socket is closed so we don't send unsubscribe and no grace period delete right away
            Reflect.deleteProperty(this.events, event)
          }
        }
      }

      this.socket && this.socket.removeEventListener(`message`, onMessage)
      return Promise.resolve()
    }

    return Promise.resolve(closeListen)
  }

  call<T>(method: string, params?: any, overwriteData?: string): Promise<RPCResponse<T>> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error(`Socket is not initialized.`))
      if (this.socket.readyState !== WebSocket.OPEN) return reject(new Error(`Can't send msg. Socket is not opened.`))

      let requestMethod = this.createRequestMethod(method, params)
      // for XSWD we want to send the application data without request method wrapping
      if (overwriteData) {
        requestMethod.id = null
        requestMethod.data = overwriteData
      }

      let timeoutId: any = null
      const onMessage = (msgEvent: MessageEvent) => {
        if (typeof msgEvent.data === `string`) {
          const data = parseData(msgEvent.data) as RPCResponse<T>
          if (data.id === requestMethod.id) {
            clearTimeout(timeoutId)
            this.socket && this.socket.removeEventListener(`message`, onMessage)
            if (data.error) return reject(new Error(data.error.message))
            else resolve(data)
          }
        }
      }

      // make sure you listen before sending data
      this.socket && this.socket.addEventListener(`message`, onMessage) // we don't use { once: true } option because of timeout feature

      if (this.timeout > 0) {
        timeoutId = setTimeout(() => {
          this.socket && this.socket.removeEventListener(`message`, onMessage)
          reject(new Error(`timeout`))
        }, this.timeout)
      }

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(requestMethod.data)
      }
    })
  }

  dataCall<T>(method: string, params?: any): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const [err, res] = await to(this.call<T>(method, params))
      if (err) return reject(err)
      return resolve(res.result)
    })
  }

  createRequestMethod(method: string, params?: any): { data: string, id: number | null } {
    const id = this.methodIdIncrement++
    const request = { id: id, jsonrpc: `2.0`, method } as RPCRequest
    if (params) request.params = params
    const data = JSON.stringify(request)
    return { data, id }
  }
}
