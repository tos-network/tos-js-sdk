// Mock for @noble/ed25519 - used in Jest tests
export const etc = {
  sha512Sync: undefined as any
}

export async function getPublicKeyAsync(privateKey: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(32).fill(1)
}

export async function signAsync(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(64).fill(2)
}

export function getPublicKey(privateKey: Uint8Array): Uint8Array {
  return new Uint8Array(32).fill(1)
}

export function sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array {
  return new Uint8Array(64).fill(2)
}

export function verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): boolean {
  return true
}

export const utils = {
  randomPrivateKey: () => new Uint8Array(32).fill(3)
}
