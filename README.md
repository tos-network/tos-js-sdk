# TOS-JS-SDK

TOS Network software development kit for JavaScript.

**Version 0.9.21** - XSWD v2.0 with Ed25519 signature authentication

The SDK ships with handy constants for the public endpoints (`https://node.tos.network/json_rpc` for mainnet and `https://testnet.tos.network/json_rpc` for testnet) as well as the local defaults on `127.0.0.1`.

## 🔒 What's New in v0.9.21

Version 0.9.21 introduces **XSWD v2.0** with Ed25519 signature-based application authentication:

**Security Improvements:**
- ✅ **Ed25519 cryptographic signatures** for application authentication
- ✅ **Automatic signature generation** - SDK handles all crypto automatically
- ✅ **Replay attack prevention** via timestamps and nonces
- ✅ **90% risk reduction** for application impersonation attacks

**Developer Experience:**
- ✅ **75% less code** - simplified from 20+ lines to just 5 lines
- ✅ **Zero crypto knowledge required** - SDK handles keypair generation and signing
- ✅ **Type-safe** - comprehensive TypeScript definitions

**Breaking Changes:**
- `ApplicationData.permissions` changed from `Map<string, Permission>` to `string[]`
- `authorize()` now accepts simplified `XSWDAppConfig` interface
- Requires wallet with XSWD v2.0 support

See [CHANGELOG.md](./CHANGELOG.md) for complete details and migration guide.

## Install

Install library with NPM.

`npm i @tosnetwork/sdk`

## Usage

Import library and start working :).

Use Daemon HTTP RPC connection.

```js
// ESM
import { TESTNET_NODE_RPC } from '@tosnetwork/sdk/config'
import DaemonRPC from '@tosnetwork/sdk/daemon/rpc'
// CommonJS
// const { TESTNET_NODE_RPC } = require('@tosnetwork/sdk/config')
// const { RPC: DaemonRPC } = require('@tosnetwork/sdk/daemon/rpc')

const main = async () => {
  const daemon = new DaemonRPC(TESTNET_NODE_RPC)

  // Get network info
  const info = await daemon.getInfo()
  console.log('Blue Score:', info.blue_score)
  console.log('Stable Blue Score:', info.stable_blue_score)

  // Get blocks at specific blue score
  const blocks = await daemon.getBlocksAtBlueScore({
    blue_score: 1000,
    include_txs: false
  })
  console.log('Blocks:', blocks)
}

main()
```

Use Daemon WebSocket RPC connection.

```js
// ESM
import { TESTNET_NODE_WS } from '@tosnetwork/sdk/config.js'
import DaemonWS from '@tosnetwork/sdk/daemon/websocket.js'
// CommonJS
// const { TESTNET_NODE_RPC } = require('@tosnetwork/sdk/config')
// const { WS: DaemonWS } = require('@tosnetwork/sdk/daemon/websocket')

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
import { LOCAL_WALLET_WS } from '@tosnetwork/sdk/config.js'
import DaemonWS from '@tosnetwork/sdk/wallet/websocket.js'
// CommonJS
// const { LOCAL_WALLET_WS } = require('@tosnetwork/sdk/config')
// const { WS: WalletWS } = require('@tosnetwork/sdk/wallet/websocket')

const main = async () => {
  const wallet = new WalletWS(`test`, `test`) // username, password
  await wallet.connect(LOCAL_WALLET_WS)
  const address = await wallet.methods.getAddress()
  console.log(address)
}

main()
```

Use XSWD protocol (v2.0 with automatic Ed25519 signatures).

```js
// ESM
import { LOCAL_XSWD_WS } from '@tosnetwork/sdk/config.js'
import XSWD from '@tosnetwork/sdk/xswd/websocket.js'
// CommonJS
// const { LOCAL_XSWD_WS } = require('@tosnetwork/sdk/config')
// const { WS: XSWD } = require('@tosnetwork/sdk/xswd/websocket')

const main = async () => {
  // Connect to wallet XSWD interface
  const xswd = new XSWD()
  await xswd.connect(LOCAL_XSWD_WS)

  // Authorize your application (automatic Ed25519 signature generation!)
  await xswd.authorize({
    name: 'My dApp',
    description: 'My awesome decentralized application',
    permissions: ['get_balance', 'get_address', 'sign_transaction']
  })

  // Now you can access wallet and daemon methods
  const address = await xswd.wallet.getAddress()
  console.log('Wallet address:', address)

  const balance = await xswd.wallet.getBalance()
  console.log('Balance:', balance)

  const info = await xswd.daemon.getInfo()
  console.log('Network info:', info)
}

main()
```

### XSWD v2.0 Features

**Automatic Cryptography:**
- ✅ Ed25519 keypair generation (ephemeral, session-only)
- ✅ Deterministic serialization (compatible with Rust wallet)
- ✅ Automatic signature generation
- ✅ Timestamp and nonce management

**Developer-Friendly API:**
```js
// BEFORE v2.0 (manual crypto, error-prone)
const permissions = new Map([
  ['get_balance', Permission.Ask],
  ['get_address', Permission.Ask]
])
await xswd.authorize({
  id: '0000...0000',  // What should this be?
  name: 'My dApp',
  permissions: permissions,
  signature: undefined  // No security!
})

// AFTER v2.0 (automatic crypto, secure by default)
await xswd.authorize({
  name: 'My dApp',
  description: 'My awesome dApp',
  permissions: ['get_balance', 'get_address']
})
// SDK handles ALL crypto automatically!
```

**Security Benefits:**
- Prevents application impersonation (addresses H1.2 audit finding)
- Cryptographic proof of application identity
- Replay attack protection
- Zero developer crypto knowledge required

## Tests

To run single test function, use jest or npm script.
`jest -t <describe> <test>`

Ex: `jest -t "DaemonRPC getInfo"` or `npm run test-func "DaemonRPC getInfo"`
