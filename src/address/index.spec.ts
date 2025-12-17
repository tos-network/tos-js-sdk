import Address from './'

// Test data - public key bytes for address generation tests
const TEST_PUBLIC_KEY = [36, 42, 28, 240, 66, 91, 191, 175, 12, 87, 131, 120, 242, 25, 34, 118,
  19, 180, 44, 244, 231, 41, 27, 147, 1, 206, 122, 50, 122, 103, 3, 9, 0]

test(`AddrFromData`, () => {
  let addr = new Address(TEST_PUBLIC_KEY, `tos`)
  let addrString = addr.format()
  console.log("Generated TOS mainnet address:", addrString)

  // Verify it starts with tos1
  if (!addrString.startsWith("tos1")) throw "Address should start with tos1"

  // Verify round-trip
  let parsed = Address.fromString(addrString)
  if (parsed.format() !== addrString) throw "Round-trip failed"
})

test(`TestnetAddrFromData`, () => {
  let addr = new Address(TEST_PUBLIC_KEY, `tst`)
  let addrString = addr.format()
  console.log("Generated TOS testnet address:", addrString)

  // Verify it starts with tst1
  if (!addrString.startsWith("tst1")) throw "Address should start with tst1"

  // Verify round-trip
  let parsed = Address.fromString(addrString)
  if (parsed.format() !== addrString) throw "Round-trip failed"
})

test(`InvalidAddr`, () => {
  // Create a valid address first
  let addr = new Address(TEST_PUBLIC_KEY, `tos`)
  let validAddr = addr.format()

  // Modify last character to make it invalid
  let invalidAddr = validAddr.slice(0, -1) + (validAddr.slice(-1) === 'a' ? 'b' : 'a')

  let isValid = Address.isValid(invalidAddr)
  if (isValid) throw "Modified address should be invalid"

  let isValid2 = Address.isValid(validAddr)
  if (!isValid2) throw "Original address should be valid"
})

test(`InvalidPrefix`, () => {
  // xel prefix should not be accepted (using bech32 separator '1')
  let isValid = Address.isValid(`xel1ys4peuzztwl67rzhsdu0yxfzwcfmgt85uu53hycpeeary7n8qvysqmxznt0`)
  if (isValid) throw "xel prefix should not be valid for TOS"
})

test(`IsMainnet`, () => {
  let mainnetAddr = new Address(TEST_PUBLIC_KEY, `tos`)
  if (!mainnetAddr.isMainnet) throw "Should be mainnet"

  let testnetAddr = new Address(TEST_PUBLIC_KEY, `tst`)
  if (testnetAddr.isMainnet) throw "Should not be mainnet"
})
