# TOS-JS-SDK

TOS Network software development kit for JavaScript.

The SDK ships with handy constants for the public endpoints (`https://node.tos.network/json_rpc` for mainnet and `https://testnet.tos.network/json_rpc` for testnet) as well as the local defaults on `127.0.0.1`.

## Install

Install library with NPM.

`npm i @tos-network/sdk`

## Usage

Import library and start working :).

Use Daemon HTTP RPC connection.

```js
// ESM
import { TESTNET_NODE_RPC } from '@tos-network/sdk/config'
import DaemonRPC from '@tos-network/sdk/daemon/rpc'
// CommonJS
// const { TESTNET_NODE_RPC } = require('@tos-network/sdk/config')
// const { RPC: DaemonRPC } = require('@tos-network/sdk/daemon/rpc')

const main = async () => {
  const daemon = new DaemonRPC(TESTNET_NODE_RPC)
  const info = await daemon.getInfo()
  console.log(info)
}

main()
```

Use Daemon WebSocket RPC connection.

```js
// ESM
import { TESTNET_NODE_WS } from '@tos-network/sdk/config.js'
import DaemonWS from '@tos-network/sdk/daemon/websocket.js'
// CommonJS
// const { TESTNET_NODE_RPC } = require('@tos-network/sdk/config')
// const { WS: DaemonWS } = require('@tos-network/sdk/daemon/websocket')

const main = async () => {
  const daemon = new DaemonWS()
  await daemon.connect(TESTNET_NODE_WS)
  const info = await daemon.methods.getInfo()
  console.log(info)
}

main()
```

Use Wallet WebSocket RPC connection.

```js
// ESM
import { LOCAL_WALLET_WS } from '@tos-network/sdk/config.js'
import DaemonWS from '@tos-network/sdk/wallet/websocket.js'
// CommonJS
// const { LOCAL_WALLET_WS } = require('@tos-network/sdk/config')
// const { WS: WalletWS } = require('@tos-network/sdk/wallet/websocket')

const main = async () => {
  const wallet = new WalletWS(`test`, `test`) // username, password
  await wallet.connect(LOCAL_WALLET_WS)
  const address = await wallet.methods.getAddress()
  console.log(address)
}

main()
```

Use XSWD protocol.

```js
// ESM
import { LOCAL_XSWD_WS } from '@tos-network/sdk/config.js'
import XSWD from '@tos-network/sdk/xswd/websocket.js'
// CommonJS
// const { LOCAL_XSWD_WS } = require('@tos-network/sdk/config')
// const { WS: XSWD } = require('@tos-network/sdk/xswd/websocket')

const main = async () => {
  const xswd = new XSWD()
  await xswd.connect(LOCAL_XSWD_WS)
  const info = await xswd.daemon.getInfo()
  console.log(info)
  const address = await xswd.wallet.getAddress()
  console.log(address)
}

main()
```

## Tests

To run single test function, use jest or npm script.
`jest -t <describe> <test>`  

Ex: `jest -t "DaemonRPC getInfo"` or `npm run test-func "DaemonRPC getInfo"`
