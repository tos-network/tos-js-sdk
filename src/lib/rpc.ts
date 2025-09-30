import { parseData } from './parse_data'
import { RPCRequest, RPCResponse, RPCBatchRequest } from './types'

export class RPC {
  endpoint: string
  timeout: number
  constructor(endpoint: string) {
    this.endpoint = endpoint
    this.timeout = 3000
  }

  async call<T>(method: string, params?: any, headers?: Headers): Promise<T> {
    const response = await this.post<T>(method, params, headers)
    return response.result
  }

  async post<T>(method: string, params?: any, headers?: Headers): Promise<RPCResponse<T>> {
    try {
      const controller = new AbortController()
      const body = JSON.stringify({ id: 1, jsonrpc: '2.0', method: method, params })

      const timeoutId = setTimeout(() => {
        controller.abort()
      }, this.timeout)

      headers = headers || new Headers()
      headers.set(`Content-Type`, `application/json`)
      const res = await fetch(this.endpoint, {
        headers,
        method: `POST`,
        body,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      if (res.ok) {
        const stringData = await res.text()
        const data = parseData(stringData) as RPCResponse<T>

        if (data.error) {
          return Promise.reject(new Error(data.error.message))
        }

        return Promise.resolve(data)
      } else {
        return Promise.reject(new Error(`${res.status} - ${res.statusText}`))
      }
    } catch (err) {
      console.log(err)
      return Promise.reject(err)
    }
  }

  async batchRequest(requests: RPCBatchRequest[]): Promise<(any | Error)[]> {
    try {
      const controller = new AbortController()
      const body = JSON.stringify(requests.map((req, index) => ({
        id: index + 1,
        jsonrpc: '2.0',
        method: req.method,
        params: req.params
      })))

      const timeoutId = setTimeout(() => {
        controller.abort()
      }, this.timeout)

      const headers = new Headers()
      headers.set(`Content-Type`, `application/json`)
      const res = await fetch(this.endpoint, {
        headers,
        method: `POST`,
        body,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      if (res.ok) {
        const stringData = await res.text()
        const responses = parseData(stringData) as RPCResponse<any>[]

        return responses.map(response => {
          if (response.error) {
            return new Error(response.error.message)
          }
          return response.result
        })
      } else {
        return Promise.reject(new Error(`${res.status} - ${res.statusText}`))
      }
    } catch (err) {
      console.log(err)
      return Promise.reject(err)
    }
  }
}