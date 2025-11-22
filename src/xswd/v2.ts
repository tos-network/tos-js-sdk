// XSWD v2.0: Ed25519 Signature Module for Application Authentication
// This module provides cryptographic functions for XSWD protocol v2.0
// Compatible with Rust implementation in wallet/src/api/xswd/verification.rs

import * as ed25519 from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha512'

// Set hash function for ed25519 (required for @noble/ed25519)
ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m))

export interface XSWDKeyPair {
  privateKey: Uint8Array  // 32 bytes - Ed25519 private key
  publicKey: Uint8Array   // 32 bytes - Ed25519 public key
}

// Generate a new Ed25519 keypair for application identity
// This keypair is ephemeral (session-only, never persisted)
// Returns: { privateKey: 32 bytes, publicKey: 32 bytes }
export async function generateKeyPair(): Promise<XSWDKeyPair> {
  const privateKey = ed25519.utils.randomPrivateKey()
  const publicKey = await ed25519.getPublicKeyAsync(privateKey)

  return {
    privateKey,
    publicKey
  }
}

// Serialize ApplicationData for Ed25519 signing
// This MUST match the Rust implementation in wallet/src/api/xswd/types.rs:serialize_for_signing()
// Format: id || name || description || url_present || url || permissions_len || permissions || public_key || timestamp || nonce
// All strings: UTF-8 encoded
// Numbers: little-endian bytes
export function serializeForSigning(data: {
  id: string
  name: string
  description: string
  url?: string
  permissions: string[]
  public_key: string
  timestamp: number
  nonce: string
}): Uint8Array {
  const encoder = new TextEncoder()
  const parts: Uint8Array[] = []

  // Field 1: id (String) - Application ID (64-char hex = 32 bytes)
  parts.push(encoder.encode(data.id))

  // Field 2: name (String) - Application name (max 32 chars)
  parts.push(encoder.encode(data.name))

  // Field 3: description (String) - Application description (max 255 chars)
  parts.push(encoder.encode(data.description))

  // Field 4: url (Option<String>)
  if (data.url) {
    parts.push(new Uint8Array([1])) // URL present
    parts.push(encoder.encode(data.url))
  } else {
    parts.push(new Uint8Array([0])) // URL not present
  }

  // Field 5: permissions (Vec<String>)
  // Format: count (u16 little-endian) followed by each permission string with null terminator
  const permCount = new Uint8Array(2)
  new DataView(permCount.buffer).setUint16(0, data.permissions.length, true) // little-endian
  parts.push(permCount)

  for (const perm of data.permissions) {
    parts.push(encoder.encode(perm))
    parts.push(new Uint8Array([0])) // Null terminator for each permission
  }

  // Field 6: public_key ([u8; 32]) - Ed25519 public key
  parts.push(hexToBytes(data.public_key))

  // Field 7: timestamp (u64) - Unix timestamp in seconds
  const timestampBytes = new Uint8Array(8)
  const timestampView = new DataView(timestampBytes.buffer)
  // JavaScript numbers are 53-bit safe integers, Unix timestamps fit
  timestampView.setBigUint64(0, BigInt(data.timestamp), true) // little-endian
  parts.push(timestampBytes)

  // Field 8: nonce (u64) - Random nonce (8 bytes)
  const nonceBytes = hexToBytes(data.nonce)
  if (nonceBytes.length !== 8) {
    throw new Error(`Invalid nonce length: ${nonceBytes.length}, expected 8 bytes`)
  }
  parts.push(nonceBytes)

  // Concatenate all parts into single Uint8Array
  const totalLength = parts.reduce((sum, p) => sum + p.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }

  return result
}

// Sign ApplicationData with Ed25519 private key
// Returns: Signature as hex string (128 chars = 64 bytes)
export async function signApplicationData(
  data: {
    id: string
    name: string
    description: string
    url?: string
    permissions: string[]
    public_key: string
    timestamp: number
    nonce: string
  },
  privateKey: Uint8Array
): Promise<string> {
  const message = serializeForSigning(data)
  const signature = await ed25519.signAsync(message, privateKey)
  return bytesToHex(signature)
}

// Utility: Convert hex string to Uint8Array
// Example: "1a2b3c" -> Uint8Array([0x1a, 0x2b, 0x3c])
export function hexToBytes(hex: string): Uint8Array {
  // Remove any 0x prefix if present
  if (hex.startsWith('0x') || hex.startsWith('0X')) {
    hex = hex.slice(2)
  }

  if (hex.length % 2 !== 0) {
    throw new Error(`Hex string must have even length, got: ${hex.length}`)
  }

  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

// Utility: Convert Uint8Array to hex string
// Example: Uint8Array([0x1a, 0x2b, 0x3c]) -> "1a2b3c"
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Generate random nonce (8 bytes) for replay attack prevention
// Uses crypto.getRandomValues() for cryptographically secure randomness
export function generateNonce(): string {
  const nonceBytes = new Uint8Array(8)

  // Use crypto.getRandomValues (available in browsers and Node.js)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(nonceBytes)
  } else if (typeof window !== 'undefined' && (window as any).msCrypto) {
    // Legacy IE11 support
    (window as any).msCrypto.getRandomValues(nonceBytes)
  } else {
    // Fallback for very old environments (not cryptographically secure)
    console.warn('crypto.getRandomValues not available, using Math.random() fallback')
    for (let i = 0; i < 8; i++) {
      nonceBytes[i] = Math.floor(Math.random() * 256)
    }
  }

  return bytesToHex(nonceBytes)
}
