/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@noble/ed25519$': '<rootDir>/src/__mocks__/@noble/ed25519.ts',
    '^@noble/hashes/sha512$': '<rootDir>/src/__mocks__/@noble/hashes/sha512.ts'
  }
}