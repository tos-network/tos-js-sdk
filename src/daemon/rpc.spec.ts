import { to } from 'await-to-js'

import { MAINNET_NODE_RPC, TESTNET_NODE_RPC, TOS_ASSET } from '../config'
import DaemonRPC from './rpc'

const TESTNET_ADDR = process.env.TOS_TESTNET_ADDRESS ?? `tst:qsl6sj2u0gp37tr6drrq964rd4d8gnaxnezgytmt0cfltnp2wsgqqak28je`
const MAINNET_ADDR = process.env.TOS_MAINNET_ADDRESS ?? `tos:qsl6sj2u0gp37tr6drrq964rd4d8gnaxnezgytmt0cfltnp2wsgqqak28je`
const SAMPLE_BLOCK_HASH = process.env.TOS_SAMPLE_BLOCK_HASH
const SAMPLE_TX_HASH = process.env.TOS_SAMPLE_TX_HASH
const SAMPLE_TX_BLOCK_HASH = process.env.TOS_SAMPLE_TX_BLOCK_HASH
const SAMPLE_TOPOHEIGHT = process.env.TOS_SAMPLE_TOPOHEIGHT ? Number(process.env.TOS_SAMPLE_TOPOHEIGHT) : undefined
const SAMPLE_SPLIT_ADDRESS = process.env.TOS_SAMPLE_SPLIT_ADDRESS

const RUN_DAEMON_INTEGRATION = process.env.RUN_TOS_DAEMON_TESTS === 'true'
const describeDaemon = RUN_DAEMON_INTEGRATION ? describe : describe.skip

const testnetDaemonRPC = new DaemonRPC(TESTNET_NODE_RPC)
// this node does not allow mining use testnet to tests mining funcs
const mainnetDaemonRPC = new DaemonRPC(MAINNET_NODE_RPC)

describeDaemon('DaemonRPC', () => {
  test(`getInfo`, async () => {
    const [err, res] = await to(testnetDaemonRPC.getInfo())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test(`getVersion`, async () => {
    const [err, res] = await to(testnetDaemonRPC.getVersion())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test(`getBlueScore`, async () => {
    const [err, res] = await to(testnetDaemonRPC.getBlueScore())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test(`getTopoheight`, async () => {
    const [err, res] = await to(testnetDaemonRPC.getTopoheight())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test(`getStableBlueScore`, async () => {
    const [err, res] = await to(testnetDaemonRPC.getStableBlueScore())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test(`getStableTopoheight`, async () => {
    const [err, res] = await to(testnetDaemonRPC.getStableTopoheight())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test(`getStableBalance`, async () => {
    const [err, res] = await to(mainnetDaemonRPC.getStableBalance({
      address: MAINNET_ADDR,
      asset: TOS_ASSET
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getBlockTemplate', async () => {
    const [err, res] = await to(testnetDaemonRPC.getBlockTemplate(TESTNET_ADDR))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getBlockAtTopoheight', async () => {
    const [err, res] = await to(testnetDaemonRPC.getBlockAtTopoheight({
      topoheight: 0
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getBlocksAtBlueScore', async () => {
    const [err, res] = await to(testnetDaemonRPC.getBlocksAtBlueScore({
      blue_score: 0
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  const blockByHashTest = SAMPLE_BLOCK_HASH ? test : test.skip
  blockByHashTest('getBlockByHash', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getBlockByHash({ hash: SAMPLE_BLOCK_HASH as string }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getTopBlock', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getTopBlock())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getNonce', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getNonce({
      address: MAINNET_ADDR,
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  const nonceAtTopoTest = Number.isFinite(SAMPLE_TOPOHEIGHT) ? test : test.skip
  nonceAtTopoTest('getNonceAtTopoheight', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getNonceAtTopoheight({
      address: MAINNET_ADDR,
      topoheight: SAMPLE_TOPOHEIGHT as number
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('hasNonce', async () => {
    const [err, res] = await to(mainnetDaemonRPC.hasNonce({
      address: MAINNET_ADDR,
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getBalance', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getBalance({
      address: MAINNET_ADDR,
      asset: TOS_ASSET
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('hasBalance', async () => {
    const [err, res] = await to(mainnetDaemonRPC.hasBalance({
      address: MAINNET_ADDR,
      asset: TOS_ASSET
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  const balanceAtTopoTest = Number.isFinite(SAMPLE_TOPOHEIGHT) ? test : test.skip
  balanceAtTopoTest('getBalanceAtTopoheight', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getBalanceAtTopoheight({
      address: MAINNET_ADDR,
      asset: TOS_ASSET,
      topoheight: SAMPLE_TOPOHEIGHT as number
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getAsset', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getAsset({
      asset: TOS_ASSET
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getAssets', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getAssets({
      skip: 0,
      maximum: 10
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('countAssets', async () => {
    const [err, res] = await to(mainnetDaemonRPC.countAssets())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('countTransactions', async () => {
    const [err, res] = await to(mainnetDaemonRPC.countTransactions())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getTips', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getTips())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('p2pStatus', async () => {
    const [err, res] = await to(mainnetDaemonRPC.p2pStatus())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getDAGOrder', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getDAGOrder())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getMempool', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getMemPool())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  const transactionTest = SAMPLE_TX_HASH ? test : test.skip
  transactionTest('getTransaction', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getTransaction(SAMPLE_TX_HASH as string))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  const transactionsTest = SAMPLE_TX_HASH ? test : test.skip
  transactionsTest('getTransactions', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getTransactions([
      SAMPLE_TX_HASH as string
    ]))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getBlocksRangeByTopoheight', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getBlocksRangeByTopoheight({
      start_topoheight: 0,
      end_topoheight: 10
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getBlocksRangeByBlueScore', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getBlocksRangeByBlueScore({
      start_blue_score: 0,
      end_blue_score: 10
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getAccounts', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getAccounts({
      skip: 0,
      maximum: 10
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('countAccounts', async () => {
    const [err, res] = await to(mainnetDaemonRPC.countAccounts())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getAccountHistory', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getAccountHistory({
      address: MAINNET_ADDR
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getAccountAssets', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getAccountAssets(MAINNET_ADDR))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getPeers', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getPeers())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getDevFeeThresholds', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getDevFeeThresholds())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getSizeOnDisk', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getSizeOnDisk())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  const txExecutedTest = SAMPLE_TX_BLOCK_HASH && SAMPLE_TX_HASH ? test : test.skip
  txExecutedTest('isTxExecutedInBlock', async () => {
    const [err, res] = await to(mainnetDaemonRPC.isTxExecutedInBlock({
      block_hash: SAMPLE_TX_BLOCK_HASH as string,
      tx_hash: SAMPLE_TX_HASH as string
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getAccountRegistrationTopoheight', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getAccountRegistrationTopoheight(MAINNET_ADDR))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('isAccountRegistered', async () => {
    const [err, res] = await to(mainnetDaemonRPC.isAccountRegistered({
      address: MAINNET_ADDR,
      in_stable_height: true
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getMempoolCache', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getMempoolCache(MAINNET_ADDR))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getDifficulty', async () => {
    const [err, res] = await to(mainnetDaemonRPC.getDifficulty())
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('validateAddress', async () => {
    const [err, res] = await to(mainnetDaemonRPC.validateAddress({
      address: MAINNET_ADDR,
      allow_integrated: false
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res).toBeTruthy()
  })

  test('extractKeyFromAddress', async () => {
    const [err, res] = await to(mainnetDaemonRPC.extractKeyFromAddress({
      address: MAINNET_ADDR,
      as_hex: true
    }))
    expect(err).toBeNull()
    console.log(res)
    expect(res)
  })

  test('getMinerWork', async () => {
    const [err1, res1] = await to(testnetDaemonRPC.getBlockTemplate(TESTNET_ADDR))
    console.log(err1, res1)
    expect(err1).toBeNull()

    const [err2, res2] = await to(testnetDaemonRPC.getMinerWork({
      template: res1?.template!
    }))
    expect(err2).toBeNull()
    console.log(res2)
    expect(res2)
  })

  const splitAddressTest = SAMPLE_SPLIT_ADDRESS ? test : test.skip
  splitAddressTest('splitAddress', async () => {
    const [err1, res1] = await to(testnetDaemonRPC.splitAddress({ address: SAMPLE_SPLIT_ADDRESS as string }))
    console.log(err1, res1)
    expect(err1).toBeNull()

    console.log(res1)
    expect(res1)
  })
})
