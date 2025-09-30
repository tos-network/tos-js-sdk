import { to } from 'await-to-js'

import { LOCAL_WALLET_RPC, TOS_ASSET } from '../config'
import WalletRPC from './rpc'

const WALLET_USERNAME = process.env.TOS_WALLET_USERNAME ?? `test`
const WALLET_PASSWORD = process.env.TOS_WALLET_PASSWORD ?? `test`
const SPLIT_ADDRESS = process.env.TOS_STEALTH_ADDRESS
const DESTINATION_ADDRESS = process.env.TOS_DESTINATION_ADDRESS
const SAMPLE_TX_HASH = process.env.TOS_SAMPLE_TX_HASH

const RUN_WALLET_INTEGRATION = process.env.RUN_TOS_WALLET_TESTS === 'true'
const describeWallet = RUN_WALLET_INTEGRATION ? describe : describe.skip

const walletRPC = new WalletRPC(LOCAL_WALLET_RPC, WALLET_USERNAME, WALLET_PASSWORD)

describeWallet('WalletRPC', () => {
  test('getVersion', async () => {
    const [err, res] = await to(walletRPC.getVersion())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getNetwork', async () => {
    const [err, res] = await to(walletRPC.getNetwork())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getNonce', async () => {
    const [err, res] = await to(walletRPC.getNonce())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getTopoheight', async () => {
    const [err, res] = await to(walletRPC.getTopoheight())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getAddress', async () => {
    const [err, res] = await to(walletRPC.getAddress())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  const splitTest = SPLIT_ADDRESS ? test : test.skip
  splitTest('splitAddress', async () => {
    const [err, res] = await to(walletRPC.splitAddress({
      address: SPLIT_ADDRESS as string
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getBalance', async () => {
    const [err, res] = await to(walletRPC.getBalance())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('hasBalance', async () => {
    const [err, res] = await to(walletRPC.hasBalance())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getTrackedAssets', async () => {
    const [err, res] = await to(walletRPC.getTrackedAssets())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getAssetPrecision', async () => {
    const [err, res] = await to(walletRPC.getAssetPrecision({
      asset: TOS_ASSET
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  const txTest = SAMPLE_TX_HASH ? test : test.skip
  txTest('getTransaction', async () => {
    const [err, res] = await to(walletRPC.getTransaction(SAMPLE_TX_HASH as string))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  const buildTxTest = DESTINATION_ADDRESS ? test : test.skip
  buildTxTest('buildTransaction', async () => {
    const [err, res] = await to(walletRPC.buildTransaction({
      broadcast: false,
      tx_as_hex: true,
      transfers: [{
        amount: 0,
        asset: TOS_ASSET,
        destination: DESTINATION_ADDRESS as string
      }],
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })
  
  test('listTransactions', async () => {
    const [err, res] = await to(walletRPC.listTransactions())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })
  
  test('isOnline', async () => {
    const [err, res] = await to(walletRPC.isOnline())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  const estimateFeesTest = DESTINATION_ADDRESS ? test : test.skip
  estimateFeesTest('estimateFees', async () => {
    const [err, res] = await to(walletRPC.estimateFees({
      transfers: [{
        amount: 0,
        asset: TOS_ASSET,
        destination: DESTINATION_ADDRESS as string
      }]
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })
})
