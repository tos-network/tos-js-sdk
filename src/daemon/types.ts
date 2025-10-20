export interface GetInfoResult {
  // GHOSTDAG consensus metrics
  blue_score: number // Current DAG depth (number of blue blocks)
  topoheight: number
  stable_blue_score: number // Confirmed DAG depth
  pruned_topoheight?: number
  top_block_hash: string

  // Supply metrics
  circulating_supply: number // emitted_supply - burned_supply
  burned_supply: number // Total burned TOS
  emitted_supply: number // Total emitted TOS
  maximum_supply: number

  // Mining and difficulty
  difficulty: string
  block_time_target: number // in milliseconds
  average_block_time: number // in milliseconds
  bps: number // Target blocks per second
  actual_bps: number // Actual blocks per second
  block_reward: number
  dev_reward: number
  miner_reward: number

  // Network state
  mempool_size: number
  network: string
  version: string
  block_version: number
}

export interface Block {
  hash: string
  topoheight?: number
  block_type: BlockType
  difficulty: string
  supply?: number
  reward?: number
  dev_reward?: number
  miner_reward?: number
  cumulative_difficulty: string
  total_fees?: number // is null if include_txs is false
  total_size_in_bytes: number
  version: number
  tips: string[]
  timestamp: number // in milliseconds
  blue_score: number // DAG depth (number of blue blocks in GHOSTDAG past set)
  nonce: string
  extra_nonce: string
  miner: string
  txs_hashes: string[]
  transactions?: Transaction[] // if include_txs is true in params
}

export interface GetBalanceParams {
  address: string
  asset: string
}

export interface GetBalanceAtTopoheightParams {
  address: string
  asset: string
  topoheight: number
}

export interface GetStableBalanceResult {
  balance: number
  stable_topoheight: number
  stable_block_hash: string
}

export interface GetNonceParams {
  address: string
}

export interface VersionedNonce {
  nonce: number
  previous_topoheight?: number
}

export interface GetNonceResult {
  version: VersionedNonce
  topoheight: number
}

export interface GetNonceAtTopoheightParams {
  address: string
  topoheight: number
}

// Balance simplification: Balances are now plaintext u64 instead of encrypted ciphertext
export enum BalanceType {
  Input = `input`,
  Output = `output`,
  Both = `both`
}

// VersionedBalance: Used by get_balance_at_topoheight endpoint
// Contains plaintext balances with version history
export interface VersionedBalance {
  balance_type: BalanceType
  final_balance: number  // Plaintext balance (u64)
  output_balance?: number  // Plaintext output balance (u64)
  previous_topoheight?: number
}

// GetBalanceResult: Used by get_balance endpoint
// Returns plaintext balance and current topoheight
export interface GetBalanceResult {
  balance: number  // Changed from version: VersionedBalance to plaintext balance
  topoheight: number
}

export interface P2PStatusResult {
  peer_count: number
  tag?: string
  peer_id: number
  our_topoheight: number
  best_topoheight: number
  median_topoheight: number
  max_peers: number
}

export interface TopoheightRangeParams {
  start_topoheight?: number
  end_topoheight?: number
}

export interface BlueScoreRangeParams {
  start_blue_score?: number
  end_blue_score?: number
}

export interface RPCEventResult {
  event: string
}

export type PeerPeers = {
  [addr: string]: `In` | `Out` | `Both`
}

export interface Peer {
  id: number
  addr: string
  local_port: number
  tag?: string
  version: string
  top_block_hash: string
  topoheight: number
  height: number
  last_ping: number // in seconds
  pruned_topoheight?: number
  peers: PeerPeers
  cumulative_difficulty: string
  connected_on: number // in seconds
}

export interface BlockOrdered {
  topoheight: number
  block_hash: string
  block_type: string
}

export interface BlockOrphaned {
  block_hash: string
  old_topoheight: number
}

export interface StableHeightChanged {
  previous_stable_height: number
  new_stable_height: number
}

export interface Proof {
  Y_0: number[]
  Y_1: number[]
  z_r: number[]
  z_x: number[]
}

export interface EqProof {
  Y_0: number[]
  Y_1: number[]
  Y_2: number[]
  z_r: number[]
  z_s: number[]
  z_x: number[]
}

// Transfer: Simplified to use plaintext amount instead of encrypted ciphertext
export interface Transfer {
  asset: string
  destination: string
  amount: number  // Plaintext transfer amount (u64)
  extra_data?: any
}

export interface Burn {
  asset: string
  amount: number
}

export interface TransactionData {
  transfers: Transfer[]
  burn: Burn
  deploy_contract?: string
  invoke_contract?: {
    contract: string
  }
  multi_sig?: {
    participants: string[]
    threshold: number
  }
}

export interface Reference {
  hash: string
  topoheight: number
}

// Transaction: Simplified structure without proof fields
export interface Transaction {
  hash: string
  version: number
  source: string
  data: TransactionData
  fee: number
  nonce: number
  signature: string
  reference: Reference
  size: number
}

export interface TransactionResponse extends Transaction {
  blocks: string[]
  executed_in_block: string
  in_mempool: boolean
  first_seen?: number // in seconds
}

export interface TransactionExecuted {
  tx_hash: string,
  block_hash: string,
  topoheight: number,
}

export interface GetAssetsParams {
  skip?: number
  maximum?: number
}

export interface GetAccountsParams {
  skip?: number
  maximum?: number
  minimum_topoheight?: number
  maximum_topoheight?: number
}

export interface GetBlockAtTopoheightParams {
  topoheight: number
  include_txs?: boolean
}

export interface GetBlocksAtBlueScoreParams {
  blue_score: number
  include_txs?: boolean
}

export interface GetBlockByHashParams {
  hash: string
  include_txs?: boolean
}

export interface GetTopBlockParams {
  include_txs?: boolean
}

export interface GetAccountHistoryParams {
  address: string
  asset?: string
  minimum_topoheight?: number
  maximum_topoheight?: number
  incoming_flow?: boolean
  outgoing_flow?: boolean
}

export interface AccountHistory {
  topoheight: number
  hash: string
  mining?: { reward: number }
  burn?: { amount: number }
  outgoing?: { to: string }
  incoming?: { from: string }
  // Developer fee reward for block miners
  dev_fee?: { reward: number }
  // Smart contract deployment transaction
  deploy_contract?: any
  // Smart contract invocation with target contract address
  invoke_contract?: { contract: string }
  // Multi-signature transaction with participants and threshold
  multi_sig?: { participants: string[], threshold: number }
  block_timestamp: number // in milliseconds
}

export interface PeerPeerListUpdated {
  peer_id: number
  peerlist: string[]
}

export interface PeerPeerDisconnected {
  peer_id: number
  peer_addr: string
}

export interface DevFee {
  fee_percentage: number
  height: number
}

export interface DiskSize {
  size_bytes: number
  size_formatted: string
}

export interface AssetData {
  topoheight: number
  decimals: number
}

export interface AssetWithData {
  asset: string
  data: AssetData
}

export interface HasBalanceParams {
  address: string
  asset: string
  topoheight?: number
}

export interface HasBalanceResult {
  exist: boolean
}

export interface HasNonceResult {
  exist: boolean
}

export interface IsTxExecutedInBlockParams {
  tx_hash: string
  block_hash: string
}

export interface GetAssetParams {
  asset: string
}

export interface GetPeersResult {
  peers: Peer[]
  total_peers: number
  hidden_peers: number
}

export enum BlockType {
  Sync = 'Sync',
  Normal = 'Normal',
  Side = 'Side',
  Orphaned = 'Orphaned'
}

export interface GetBlockTemplateResult {
  template: string
  height: number
  topoheight: number
  difficulty: string
  algorithm: string
}

export interface HasNonceParams {
  address: string
  topoheight?: number
}

export interface IsAccountRegisteredParams {
  address: string
  in_stable_height: boolean
}

export interface GetMempoolCacheResult {
  min: number
  max: number
  txs: string[]
  balances: Map<string, string>
}

export interface GetDifficultyResult {
  difficulty: string
  hashrate: string
  hashrate_formatted: string
}

export interface ValidateAddressParams {
  address: string
  allow_integrated: boolean
}

export interface ValidateAddressResult {
  is_integrated: boolean
  is_valid: boolean
}

export interface ExtractKeyFromAddressParams {
  address: string
  as_hex: boolean
}

export interface SubmitBlockParams {
  block_template: string
  miner_work?: string
}

export interface GetMinerWorkParams {
  template: string
  address?: string
}

export interface GetMinerWorkResult {
  miner_work: string
  algorithm: string
  height: number
  difficulty: string
  topoheight: number
}

export interface SplitAddressParams {
  address: string
}

export interface SplitAddressResult {
  address: string
  integrated_data: string
}

export enum RPCMethod {
  GetVersion = 'get_version',
  GetInfo = 'get_info',
  // FIXED: Changed from 'get_height' to 'get_blue_score' to match daemon API
  // The daemon uses GHOSTDAG consensus where blue_score represents the DAG depth
  GetHeight = 'get_blue_score',
  GetTopoheight = 'get_topoheight',
  // NOTE: get_stableheight is deprecated in daemon, but still supported for backward compatibility
  // The preferred method is get_stable_blue_score
  GetStableHeight = 'get_stable_blue_score',
  GetStableTopoheight = 'get_stable_topoheight',
  GetStableBalance = 'get_stable_balance',
  GetBlockTemplate = 'get_block_template',
  GetBlockAtTopoheight = 'get_block_at_topoheight',
  // FIXED: Changed from 'get_blocks_at_height' to 'get_blocks_at_blue_score'
  GetBlocksAtHeight = 'get_blocks_at_blue_score',
  GetBlockByHash = 'get_block_by_hash',
  GetTopBlock = 'get_top_block',
  GetNonce = 'get_nonce',
  GetNonceAtTopoheight = 'get_nonce_at_topoheight',
  HasNonce = 'has_nonce',
  GetBalance = 'get_balance',
  HasBalance = 'has_balance',
  GetBalanceAtTopoheight = 'get_balance_at_topoheight',
  GetAsset = 'get_asset',
  GetAssets = 'get_assets',
  CountAssets = 'count_assets',
  CountTransactions = 'count_transactions',
  GetTips = 'get_tips',
  P2PStatus = 'p2p_status',
  GetDAGOrder = 'get_dag_order',
  GetMempool = 'get_mempool',
  GetTransaction = 'get_transaction',
  GetTransactions = 'get_transactions',
  GetBlocksRangeByTopoheight = 'get_blocks_range_by_topoheight',
  // FIXED: Changed from 'get_blocks_range_by_height' to 'get_blocks_range_by_blue_score'
  GetBlocksRangeByHeight = 'get_blocks_range_by_blue_score',
  GetAccounts = 'get_accounts',
  SubmitBlock = 'submit_block',
  SubmitTransaction = 'submit_transaction',
  CountAccounts = 'count_accounts',
  GetAccountHistory = 'get_account_history',
  GetAccountAssets = 'get_account_assets',
  GetPeers = 'get_peers',
  GetDevFeeThresholds = 'get_dev_fee_thresholds',
  GetSizeOnDisk = 'get_size_on_disk',
  IsTxExecutedInBlock = 'is_tx_executed_in_block',
  GetAccountRegistrationTopoheight = 'get_account_registration_topoheight',
  IsAccountRegistered = 'is_account_registered',
  GetMempoolCache = 'get_mempool_cache',
  GetDifficulty = 'get_difficulty',
  ValidateAddress = 'validate_address',
  ExtractKeyFromAddress = 'extract_key_from_address',
  GetMinerWork = 'get_miner_work',
  SplitAddress = 'split_address'
}

export enum RPCEvent {
  NewBlock = `new_block`,
  BlockOrdered = `block_ordered`,
  BlockOrphaned = `block_orphaned`,
  StableHeightChanged = `stable_height_changed`,
  TransactionOrphaned = `transaction_orphaned`,
  TransactionAddedInMempool = `transaction_added_in_mempool`,
  TransactionExecuted = `transaction_executed`,
  TransactionSCResult = `transaction_sc_result`,
  NewAsset = `new_asset`,
  PeerConnected = `peer_connected`,
  PeerDisconnected = `peer_disconnected`,
  PeerPeerListUpdated = `peer_peer_list_updated`,
  PeerStateUpdated = `peer_state_updated`,
  PeerPeerDisconnected = `peer_peer_disconnected`,
}