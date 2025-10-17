import {
  Block, TopoheightRangeParams, GetInfoResult, BlueScoreRangeParams,
  GetBalanceResult, P2PStatusResult, RPCMethod, GetBalanceParams,
  GetBalanceAtTopoheightParams, GetAccountsParams, GetBlockAtTopoheightParams, GetBlockByHashParams,
  GetBlocksAtBlueScoreParams, GetTopBlockParams, GetNonceResult, GetNonceParams, GetAccountHistoryParams,
  AccountHistory, DevFee, DiskSize, HasBalanceParams, HasBalanceResult, AssetData, IsTxExecutedInBlockParams,
  GetAssetParams, GetPeersResult, GetBlockTemplateResult, VersionedBalance, VersionedNonce,
  GetNonceAtTopoheightParams, HasNonceParams, HasNonceResult, TransactionResponse,
  IsAccountRegisteredParams, GetMempoolCacheResult, GetDifficultyResult, ValidateAddressParams,
  ExtractKeyFromAddressParams, SubmitBlockParams, GetMinerWorkParams, GetMinerWorkResult,
  ValidateAddressResult, GetStableBalanceResult, GetAssetsParams, SplitAddressParams, SplitAddressResult
} from './types'

import { RPC as BaseRPC } from '../lib/rpc'

export class RPC extends BaseRPC {
  getVersion() {
    return this.call<string>(RPCMethod.GetVersion)
  }

  /**
   * Get the current blue score (DAG depth) of the blockchain.
   * This represents the number of blue blocks in the GHOSTDAG past set.
   * @returns The current blue score
   */
  getBlueScore() {
    return this.call<number>(RPCMethod.GetHeight)
  }

  /**
   * Get the current topoheight (topological order index).
   * @returns The current topoheight
   */
  getTopoheight() {
    return this.call<number>(RPCMethod.GetTopoheight)
  }

  /**
   * Get the stable blue score (confirmed DAG depth).
   * @returns The stable blue score
   */
  getStableBlueScore() {
    return this.call<number>(RPCMethod.GetStableHeight)
  }

  /**
   * Get the stable topoheight (confirmed topological order index).
   * @returns The stable topoheight
   */
  getStableTopoheight() {
    return this.call<number>(RPCMethod.GetStableTopoheight)
  }

  getStableBalance(params: GetBalanceParams) {
    return this.call<GetStableBalanceResult>(RPCMethod.GetStableBalance, params)
  }

  getBlockTemplate(address: string) {
    return this.call<GetBlockTemplateResult>(RPCMethod.GetBlockTemplate, { address })
  }

  getBlockAtTopoheight(params: GetBlockAtTopoheightParams) {
    return this.call<Block>(RPCMethod.GetBlockAtTopoheight, params)
  }

  /**
   * Get blocks at a specific blue score (DAG depth).
   * @param params Parameters with blue_score and optional include_txs
   * @returns Array of blocks at the specified blue score
   */
  getBlocksAtBlueScore(params: GetBlocksAtBlueScoreParams) {
    return this.call<Block[]>(RPCMethod.GetBlocksAtHeight, params)
  }

  getBlockByHash(params: GetBlockByHashParams) {
    return this.call<Block>(RPCMethod.GetBlockByHash, params)
  }

  getTopBlock(params?: GetTopBlockParams) {
    return this.call<Block>(RPCMethod.GetTopBlock, params)
  }

  submitBlock(params: SubmitBlockParams) {
    return this.call<boolean>(RPCMethod.SubmitBlock, params)
  }

  getBalance(params: GetBalanceParams) {
    return this.call<GetBalanceResult>(RPCMethod.GetBalance, params)
  }

  hasBalance(params: HasBalanceParams) {
    return this.call<HasBalanceResult>(RPCMethod.HasBalance, params)
  }

  getBalanceAtTopoheight(params: GetBalanceAtTopoheightParams) {
    return this.call<VersionedBalance>(RPCMethod.GetBalanceAtTopoheight, params)
  }

  getInfo() {
    return this.call<GetInfoResult>(RPCMethod.GetInfo)
  }

  getNonce(params: GetNonceParams) {
    return this.call<GetNonceResult>(RPCMethod.GetNonce, params)
  }

  hasNonce(params: HasNonceParams) {
    return this.call<HasNonceResult>(RPCMethod.HasNonce, params)
  }

  getNonceAtTopoheight(params: GetNonceAtTopoheightParams) {
    return this.call<VersionedNonce>(RPCMethod.GetNonceAtTopoheight, params)
  }

  getAsset(params: GetAssetParams) {
    return this.call<AssetData>(RPCMethod.GetAsset, params)
  }

  getAssets(params: GetAssetsParams) {
    return this.call<string[]>(RPCMethod.GetAssets, params)
  }

  countAssets() {
    return this.call<number>(RPCMethod.CountAssets)
  }

  countAccounts() {
    return this.call<number>(RPCMethod.CountAccounts)
  }

  countTransactions() {
    return this.call<number>(RPCMethod.CountTransactions)
  }

  submitTransaction(hexData: string) {
    return this.call<boolean>(RPCMethod.SubmitTransaction, { data: hexData })
  }

  getTransaction(hash: string) {
    return this.call<TransactionResponse>(RPCMethod.GetTransaction, { hash })
  }

  p2pStatus() {
    return this.call<P2PStatusResult>(RPCMethod.P2PStatus)
  }

  getPeers() {
    return this.call<GetPeersResult>(RPCMethod.GetPeers)
  }

  getMemPool() {
    return this.call<TransactionResponse[]>(RPCMethod.GetMempool)
  }

  getTips() {
    return this.call<string[]>(RPCMethod.GetTips)
  }

  getDAGOrder(params?: TopoheightRangeParams) {
    return this.call<string[]>(RPCMethod.GetDAGOrder, params)
  }

  getBlocksRangeByTopoheight(params: TopoheightRangeParams) {
    return this.call<Block[]>(RPCMethod.GetBlocksRangeByTopoheight, params)
  }

  /**
   * Get blocks in a range by blue score (DAG depth).
   * @param params Range parameters with start_blue_score and end_blue_score
   * @returns Array of blocks in the specified range
   */
  getBlocksRangeByBlueScore(params: BlueScoreRangeParams) {
    return this.call<Block[]>(RPCMethod.GetBlocksRangeByHeight, params)
  }

  getTransactions(txHashes: string[]) {
    return this.call<TransactionResponse[]>(RPCMethod.GetTransactions, { tx_hashes: txHashes })
  }

  getAccountHistory(params: GetAccountHistoryParams) {
    return this.call<AccountHistory[]>(RPCMethod.GetAccountHistory, params)
  }

  getAccountAssets(address: string) {
    return this.call<string[]>(RPCMethod.GetAccountAssets, { address })
  }

  getAccounts(params: GetAccountsParams) {
    return this.call<string[]>(RPCMethod.GetAccounts, params)
  }

  isTxExecutedInBlock(params: IsTxExecutedInBlockParams) {
    return this.call<boolean>(RPCMethod.IsTxExecutedInBlock, params)
  }

  getDevFeeThresholds() {
    return this.call<DevFee[]>(RPCMethod.GetDevFeeThresholds)
  }

  getSizeOnDisk() {
    return this.call<DiskSize>(RPCMethod.GetSizeOnDisk)
  }

  getAccountRegistrationTopoheight(address: String) {
    return this.call<Number>(RPCMethod.GetAccountRegistrationTopoheight, { address })
  }

  isAccountRegistered(params: IsAccountRegisteredParams) {
    return this.call<boolean>(RPCMethod.IsAccountRegistered, params)
  }

  getMempoolCache(address: String) {
    return this.call<GetMempoolCacheResult>(RPCMethod.GetMempoolCache, { address })
  }

  getDifficulty() {
    return this.call<GetDifficultyResult>(RPCMethod.GetDifficulty)
  }

  validateAddress(params: ValidateAddressParams) {
    return this.call<ValidateAddressResult>(RPCMethod.ValidateAddress, params)
  }

  extractKeyFromAddress(params: ExtractKeyFromAddressParams) {
    return this.call<string | number[]>(RPCMethod.ExtractKeyFromAddress, params)
  }

  getMinerWork(params: GetMinerWorkParams) {
    return this.call<GetMinerWorkResult>(RPCMethod.GetMinerWork, params)
  }

  splitAddress(params: SplitAddressParams) {
    return this.call<SplitAddressResult>(RPCMethod.SplitAddress, params)
  }
}

export default RPC
