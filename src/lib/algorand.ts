// Algorand TestNet Configuration (Inline)
export const ALGOD_SERVER = "https://testnet-api.algonode.cloud";
export const ALGOD_TOKEN = "";
export const CHAIN_ID = "TestNet";

import algosdk from 'algosdk'
import { PeraWalletConnect } from '@perawallet/connect'

// Initialize Algorand client with inline constants
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, '')
const indexerClient = new algosdk.Indexer('', 'https://testnet-idx.algonode.cloud', '')

// Initialize Pera Wallet for TestNet
const peraWallet = new PeraWalletConnect({
  chainId: 416002 // TestNet chain ID
})

export interface AlgorandAccount {
  address: string
  balance: number
  assets: any[]
}

export interface TokenCreationResult {
  success: boolean
  assetId?: number
  transactionId?: string
  error?: string
}

export class AlgorandService {
  private static instance: AlgorandService
  private connectedAccount: string | null = null

  static getInstance(): AlgorandService {
    if (!AlgorandService.instance) {
      AlgorandService.instance = new AlgorandService()
    }
    return AlgorandService.instance
  }

  async connectWallet(): Promise<{ success: boolean; account?: string; error?: string }> {
    try {
      const accounts = await peraWallet.connect()
      
      if (accounts.length > 0) {
        this.connectedAccount = accounts[0]
        return { success: true, account: accounts[0] }
      }
      
      return { success: false, error: 'No accounts found' }
    } catch (error: any) {
      console.error('Wallet connection failed:', error)
      return { success: false, error: error.message || 'Connection failed' }
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      await peraWallet.disconnect()
      this.connectedAccount = null
    } catch (error) {
      console.error('Disconnect failed:', error)
    }
  }

  async getAccountInfo(address: string): Promise<AlgorandAccount | null> {
    try {
      const accountInfo = await algodClient.accountInformation(address).do()
      
      return {
        address: accountInfo.address,
        balance: accountInfo.amount / 1000000, // Convert microAlgos to Algos
        assets: accountInfo.assets || []
      }
    } catch (error) {
      console.error('Failed to get account info:', error)
      return null
    }
  }

  async createAquaponicToken(params: {
    unitName: string
    assetName: string
    total: number
    decimals: number
    url?: string
    metadataHash?: Uint8Array
  }): Promise<TokenCreationResult> {
    if (!this.connectedAccount) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      // Get suggested transaction parameters
      const suggestedParams = await algodClient.getTransactionParams().do()

      // Create asset creation transaction
      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: this.connectedAccount,
        total: params.total,
        decimals: params.decimals,
        assetName: params.assetName,
        unitName: params.unitName,
        assetURL: params.url,
        assetMetadataHash: params.metadataHash,
        defaultFrozen: false,
        freeze: undefined,
        manager: this.connectedAccount,
        reserve: this.connectedAccount,
        clawback: undefined,
        suggestedParams
      })

      // Sign transaction with Pera Wallet
      const signedTxns = await peraWallet.signTransaction([
        [{ txn: txn, signers: [this.connectedAccount] }]
      ])

      // Submit transaction
      const { txId } = await algodClient.sendRawTransaction(signedTxns[0]).do()

      // Wait for confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4)
      
      // Extract asset ID from transaction
      const assetId = confirmedTxn['asset-index']

      return {
        success: true,
        assetId,
        transactionId: txId
      }
    } catch (error: any) {
      console.error('Token creation failed:', error)
      return { success: false, error: error.message || 'Token creation failed' }
    }
  }

  async transferAsset(params: {
    assetId: number
    amount: number
    to: string
    note?: string
  }): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    if (!this.connectedAccount) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      const suggestedParams = await algodClient.getTransactionParams().do()

      const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: this.connectedAccount,
        to: params.to,
        amount: params.amount,
        assetIndex: params.assetId,
        note: params.note ? new Uint8Array(Buffer.from(params.note)) : undefined,
        suggestedParams
      })

      const signedTxns = await peraWallet.signTransaction([
        [{ txn: txn, signers: [this.connectedAccount] }]
      ])

      const { txId } = await algodClient.sendRawTransaction(signedTxns[0]).do()
      await algosdk.waitForConfirmation(algodClient, txId, 4)

      return { success: true, transactionId: txId }
    } catch (error: any) {
      console.error('Asset transfer failed:', error)
      return { success: false, error: error.message || 'Transfer failed' }
    }
  }

  async getAssetInfo(assetId: number): Promise<any> {
    try {
      const assetInfo = await algodClient.getAssetByID(assetId).do()
      return assetInfo
    } catch (error) {
      console.error('Failed to get asset info:', error)
      return null
    }
  }

  async searchTransactions(address: string, assetId?: number): Promise<any[]> {
    try {
      let query = indexerClient.searchForTransactions()
        .address(address)
        .limit(50)

      if (assetId) {
        query = query.assetID(assetId)
      }

      const response = await query.do()
      return response.transactions || []
    } catch (error) {
      console.error('Failed to search transactions:', error)
      return []
    }
  }

  getConnectedAccount(): string | null {
    return this.connectedAccount
  }

  isConnected(): boolean {
    return this.connectedAccount !== null
  }

  getExplorerUrl(txId: string): string {
    // Always use TestNet explorer with inline config
    return `https://testnet.algoexplorer.io/tx/${txId}`
  }

  getNetworkInfo() {
    return {
      server: ALGOD_SERVER,
      token: ALGOD_TOKEN,
      chainId: CHAIN_ID,
      network: 'TestNet'
    }
  }
}

export const algorand = AlgorandService.getInstance()