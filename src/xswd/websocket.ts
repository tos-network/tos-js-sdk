import { WS as BaseWS } from '../lib/websocket'
import { ApplicationData } from '../wallet/types'
import { DaemonMethods } from '../daemon/websocket'
import { WalletMethods } from '../wallet/websocket'
import { generateKeyPair, signApplicationData, generateNonce, bytesToHex } from './v2'

// XSWD v2.0: Application configuration for authorization
// Simplified interface for developers (crypto handled automatically)
export interface XSWDAppConfig {
  name: string              // Application name (max 32 chars)
  description: string       // Application description (max 255 chars)
  url?: string              // Optional application URL
  permissions: string[]     // Requested RPC methods (e.g., ["get_balance", "sign_transaction"])
}

export class WS extends BaseWS {
  daemon: DaemonMethods
  wallet: WalletMethods

  // XSWD v2.0: Store keypair for this session (ephemeral, never persisted)
  private privateKey?: Uint8Array
  private publicKey?: Uint8Array

  constructor() {
    super()
    this.timeout = 0
    this.daemon = new DaemonMethods(this, "node.")
    this.wallet = new WalletMethods(this, "wallet.")
  }

  // XSWD v2.0: Automatic Ed25519 signature generation
  // Developer-friendly interface - SDK handles all cryptography automatically
  //
  // Usage:
  //   await xswd.authorize({
  //     name: 'My App',
  //     description: 'My dApp',
  //     permissions: ['get_balance', 'sign_transaction']
  //   })
  async authorize(appConfig: XSWDAppConfig): Promise<any> {
    // Generate Ed25519 keypair for this application instance
    const keyPair = await generateKeyPair()
    this.privateKey = keyPair.privateKey
    this.publicKey = keyPair.publicKey

    // Convert public key to hex
    const publicKeyHex = bytesToHex(this.publicKey)

    // Derive application ID from public key (use full public key as ID)
    const id = publicKeyHex

    // Generate current Unix timestamp (seconds since epoch)
    const timestamp = Math.floor(Date.now() / 1000)

    // Generate cryptographically secure random nonce (8 bytes = 16 hex chars)
    const nonce = generateNonce()

    // Create ApplicationData (without signature yet)
    const appData = {
      id,
      name: appConfig.name,
      description: appConfig.description,
      url: appConfig.url,
      permissions: appConfig.permissions,
      public_key: publicKeyHex,
      timestamp,
      nonce
    }

    // Sign the ApplicationData with Ed25519
    const signature = await signApplicationData(appData, this.privateKey)

    // Create final ApplicationData with signature
    const signedAppData: ApplicationData = {
      ...appData,
      signature
    }

    // Send to wallet for authorization
    const data = JSON.stringify(signedAppData)
    return this.call("", {}, data)
  }

  // Legacy method for backward compatibility (deprecated)
  // Use authorize(appConfig: XSWDAppConfig) instead
  authorizeRaw(app: ApplicationData) {
    const data = JSON.stringify(app)
    return this.call("", {}, data)
  }
}

export default WS
