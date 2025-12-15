// Mock for @noble/hashes/sha512 - used in Jest tests
export function sha512(data: Uint8Array): Uint8Array {
  return new Uint8Array(64).fill(4)
}
