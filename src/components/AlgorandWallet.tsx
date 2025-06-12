import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { algorand, AlgorandAccount } from '../lib/algorand'
import { 
  Wallet, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Loader,
  Coins
} from 'lucide-react'

interface AlgorandWalletProps {
  onAccountChange?: (account: string | null) => void
}

export function AlgorandWallet({ onAccountChange }: AlgorandWalletProps) {
  const [connected, setConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [accountInfo, setAccountInfo] = useState<AlgorandAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Check if already connected
    const connectedAccount = algorand.getConnectedAccount()
    if (connectedAccount) {
      setConnected(true)
      setAccount(connectedAccount)
      fetchAccountInfo(connectedAccount)
    }
  }, [])

  useEffect(() => {
    if (onAccountChange) {
      onAccountChange(account)
    }
  }, [account, onAccountChange])

  const fetchAccountInfo = async (address: string) => {
    try {
      const info = await algorand.getAccountInfo(address)
      setAccountInfo(info)
    } catch (error) {
      console.error('Failed to fetch account info:', error)
    }
  }

  const handleConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await algorand.connectWallet()
      
      if (result.success && result.account) {
        setConnected(true)
        setAccount(result.account)
        await fetchAccountInfo(result.account)
      } else {
        setError(result.error || 'Connection failed')
      }
    } catch (error: any) {
      setError(error.message || 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await algorand.disconnectWallet()
      setConnected(false)
      setAccount(null)
      setAccountInfo(null)
    } catch (error) {
      console.error('Disconnect failed:', error)
    }
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  if (!connected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="text-center">
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl inline-flex mb-4">
            <Wallet className="h-8 w-8 text-emerald-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Connect Algorand Wallet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Connect your Pera Wallet to enable blockchain tokenization features
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConnect}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <span>Connect Pera Wallet</span>
              </div>
            )}
          </motion.button>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            Don't have Pera Wallet? <a href="https://perawallet.app" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">Download here</a>
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
            <Wallet className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Algorand Wallet Connected
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Ready for blockchain operations
            </p>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>

      {account && (
        <div className="space-y-4">
          {/* Account Address */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Wallet Address
                </p>
                <p className="text-sm font-mono text-slate-900 dark:text-white">
                  {formatAddress(account)}
                </p>
              </div>
              <button
                onClick={copyAddress}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Account Balance */}
          {accountInfo && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  {accountInfo.balance.toFixed(2)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  ALGO Balance
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                <div className="text-2xl font-bold text-teal-600 mb-1">
                  {accountInfo.assets.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Assets Owned
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex space-x-3">
            <a
              href={`https://testnet.algoexplorer.io/address/${account}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center space-x-2 p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="text-sm font-medium">View on Explorer</span>
            </a>
            
            <button className="flex-1 flex items-center justify-center space-x-2 p-3 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl transition-colors">
              <Coins className="h-4 w-4" />
              <span className="text-sm font-medium">Create Token</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}