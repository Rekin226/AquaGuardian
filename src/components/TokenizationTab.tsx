import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { supabase, Design, Token } from '../lib/supabase'
import { SimulationResult } from '../lib/simulator'
import { 
  Coins, 
  TrendingUp, 
  Shield, 
  Users, 
  DollarSign,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader,
  Share2,
  Download,
  Settings,
  FileText,
  Link as LinkIcon
} from 'lucide-react'

interface TokenizationTabProps {
  design: Design
  simulation: SimulationResult
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  design: Design
  tokenValue: number
}

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  design: Design
  simulation: SimulationResult
  tokens: Token[]
}

interface ConfigureModalProps {
  isOpen: boolean
  onClose: () => void
  design: Design
  onSave: (config: TokenConfig) => void
}

interface TokenConfig {
  tokenName: string
  tokenSymbol: string
  totalSupply: number
  decimals: number
  description: string
  website: string
  enableFractionalOwnership: boolean
  minimumInvestment: number
}

function ShareModal({ isOpen, onClose, design, tokenValue }: ShareModalProps) {
  const [copied, setCopied] = useState<string | null>(null)
  
  if (!isOpen) return null

  const shareUrl = `${window.location.origin}/marketplace/design/${design.id}`
  const shareText = `Check out this aquaponic system design: ${design.name} - Estimated value: $${tokenValue.toLocaleString()}`

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: LinkIcon,
      action: () => copyToClipboard(shareUrl, 'link'),
      color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    },
    {
      name: 'Twitter',
      icon: ExternalLink,
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank'),
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    },
    {
      name: 'LinkedIn',
      icon: ExternalLink,
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank'),
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    },
    {
      name: 'Email',
      icon: ExternalLink,
      action: () => window.open(`mailto:?subject=${encodeURIComponent(design.name)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_blank'),
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Share Design
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">{design.name}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Estimated Token Value: ${tokenValue.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option, index) => (
              <button
                key={option.name}
                onClick={option.action}
                className={`p-4 rounded-xl transition-all duration-200 hover:scale-105 ${option.color}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <option.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {copied === option.name.toLowerCase() ? 'Copied!' : option.name}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Share URL
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
              />
              <button
                onClick={() => copyToClipboard(shareUrl, 'url')}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
              >
                {copied === 'url' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function ExportModal({ isOpen, onClose, design, simulation, tokens }: ExportModalProps) {
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'json' | 'csv'>('pdf')

  if (!isOpen) return null

  const handleExport = async () => {
    setExporting(true)
    
    try {
      const exportData = {
        design: {
          name: design.name,
          created_at: design.created_at,
          parameters: design.params
        },
        simulation: {
          fishYieldKg: simulation.fishYieldKg,
          vegYieldKg: simulation.vegYieldKg,
          dailyWaterL: simulation.dailyWaterL,
          dailyKWh: simulation.dailyKWh,
          systemEfficiency: simulation.systemEfficiency,
          monthlyOperatingCost: simulation.monthlyOperatingCost
        },
        tokens: tokens.map(token => ({
          id: token.id,
          created_at: token.created_at,
          algorand_tx: token.algorand_tx
        })),
        exported_at: new Date().toISOString()
      }

      if (exportFormat === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${design.name.replace(/\s+/g, '_')}_export.json`
        a.click()
        URL.revokeObjectURL(url)
      } else if (exportFormat === 'csv') {
        const csvData = [
          ['Metric', 'Value', 'Unit'],
          ['Fish Yield', simulation.fishYieldKg, 'kg/year'],
          ['Vegetable Yield', simulation.vegYieldKg, 'kg/year'],
          ['Daily Water Usage', simulation.dailyWaterL, 'L/day'],
          ['Daily Energy Usage', simulation.dailyKWh, 'kWh/day'],
          ['System Efficiency', simulation.systemEfficiency, '%'],
          ['Monthly Operating Cost', simulation.monthlyOperatingCost, 'USD'],
          ['Tokens Created', tokens.length, 'count']
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csvData], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${design.name.replace(/\s+/g, '_')}_data.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else if (exportFormat === 'pdf') {
        // Generate PDF report
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${design.name} - AquaGuardian Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 40px; }
              .section { margin-bottom: 30px; }
              .metric { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
              .token { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${design.name}</h1>
              <p>AquaGuardian System Report</p>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
              <h2>System Configuration</h2>
              <div class="metric"><span>Farm Size:</span><span>${design.params.farmSize}</span></div>
              <div class="metric"><span>Fish Species:</span><span>${design.params.fishSpecies?.join(', ')}</span></div>
              <div class="metric"><span>Crops:</span><span>${design.params.cropChoice?.join(', ')}</span></div>
              <div class="metric"><span>Budget:</span><span>${design.params.budget}</span></div>
              <div class="metric"><span>Energy Source:</span><span>${design.params.energySource}</span></div>
            </div>
            
            <div class="section">
              <h2>Performance Metrics</h2>
              <div class="metric"><span>Annual Fish Yield:</span><span>${simulation.fishYieldKg} kg</span></div>
              <div class="metric"><span>Annual Vegetable Yield:</span><span>${simulation.vegYieldKg} kg</span></div>
              <div class="metric"><span>Daily Water Usage:</span><span>${simulation.dailyWaterL} L</span></div>
              <div class="metric"><span>Daily Energy Usage:</span><span>${simulation.dailyKWh} kWh</span></div>
              <div class="metric"><span>System Efficiency:</span><span>${simulation.systemEfficiency}%</span></div>
              <div class="metric"><span>Monthly Operating Cost:</span><span>$${simulation.monthlyOperatingCost}</span></div>
            </div>
            
            <div class="section">
              <h2>Blockchain Tokens</h2>
              ${tokens.map(token => `
                <div class="token">
                  <strong>Token #${token.id.slice(-8)}</strong><br>
                  Created: ${new Date(token.created_at).toLocaleDateString()}<br>
                  ${token.algorand_tx ? `Transaction: ${token.algorand_tx}` : 'No transaction recorded'}
                </div>
              `).join('')}
            </div>
          </body>
          </html>
        `

        const blob = new Blob([htmlContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${design.name.replace(/\s+/g, '_')}_report.html`
        a.click()
        URL.revokeObjectURL(url)
      }

      setTimeout(() => {
        setExporting(false)
        onClose()
      }, 1000)
    } catch (error) {
      console.error('Export failed:', error)
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Export Data
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Export Format
            </label>
            <div className="space-y-2">
              {[
                { value: 'pdf', label: 'PDF Report', desc: 'Comprehensive system report' },
                { value: 'json', label: 'JSON Data', desc: 'Machine-readable format' },
                { value: 'csv', label: 'CSV Metrics', desc: 'Spreadsheet-compatible data' }
              ].map((format) => (
                <label key={format.value} className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value={format.value}
                    checked={exportFormat === format.value}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="text-emerald-600"
                  />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{format.label}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{format.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Export Includes:</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• System configuration parameters</li>
              <li>• Performance simulation results</li>
              <li>• Blockchain token information</li>
              <li>• Creation timestamps and metadata</li>
            </ul>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {exporting ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Exporting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export {exportFormat.toUpperCase()}</span>
              </div>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function ConfigureModal({ isOpen, onClose, design, onSave }: ConfigureModalProps) {
  const [config, setConfig] = useState<TokenConfig>({
    tokenName: `${design.name} Token`,
    tokenSymbol: 'AQUA',
    totalSupply: 1000000,
    decimals: 6,
    description: `Tokenized aquaponic system: ${design.name}`,
    website: 'https://aquaguardian.green',
    enableFractionalOwnership: true,
    minimumInvestment: 100
  })
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(config)
      setTimeout(() => {
        setSaving(false)
        onClose()
      }, 1000)
    } catch (error) {
      console.error('Save failed:', error)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Configure Token
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Token Name
              </label>
              <input
                type="text"
                value={config.tokenName}
                onChange={(e) => setConfig(prev => ({ ...prev, tokenName: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Token Symbol
              </label>
              <input
                type="text"
                value={config.tokenSymbol}
                onChange={(e) => setConfig(prev => ({ ...prev, tokenSymbol: e.target.value.toUpperCase() }))}
                maxLength={8}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Total Supply
              </label>
              <input
                type="number"
                value={config.totalSupply}
                onChange={(e) => setConfig(prev => ({ ...prev, totalSupply: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Decimals
              </label>
              <input
                type="number"
                value={config.decimals}
                onChange={(e) => setConfig(prev => ({ ...prev, decimals: parseInt(e.target.value) }))}
                min={0}
                max={18}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={config.website}
              onChange={(e) => setConfig(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Enable Fractional Ownership</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Allow multiple investors to own shares</div>
              </div>
              <button
                onClick={() => setConfig(prev => ({ ...prev, enableFractionalOwnership: !prev.enableFractionalOwnership }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.enableFractionalOwnership ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.enableFractionalOwnership ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {config.enableFractionalOwnership && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Minimum Investment ($)
                </label>
                <input
                  type="number"
                  value={config.minimumInvestment}
                  onChange={(e) => setConfig(prev => ({ ...prev, minimumInvestment: parseInt(e.target.value) }))}
                  min={1}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-600 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Configuration'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function TokenizationTab({ design, simulation }: TokenizationTabProps) {
  const { user } = useAuth()
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showConfigureModal, setShowConfigureModal] = useState(false)

  useEffect(() => {
    fetchTokens()
  }, [design.id])

  const fetchTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('design_id', design.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTokens(data || [])
    } catch (error) {
      console.error('Error fetching tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  const createToken = async () => {
    if (!user) return

    setCreating(true)
    try {
      // Simulate token creation (in real implementation, this would interact with Algorand)
      const mockTxId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`
      
      const { data, error } = await supabase
        .from('tokens')
        .insert({
          design_id: design.id,
          algorand_tx: mockTxId,
        })
        .select()
        .single()

      if (error) throw error
      
      setTokens(prev => [data, ...prev])
    } catch (error) {
      console.error('Error creating token:', error)
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleExport = () => {
    setShowExportModal(true)
  }

  const handleConfigure = () => {
    setShowConfigureModal(true)
  }

  const handleSaveConfiguration = async (config: TokenConfig) => {
    // Save token configuration to database or local storage
    console.log('Saving token configuration:', config)
    
    // In a real implementation, you would save this to the database
    // and use it when creating actual tokens on Algorand
    try {
      const { error } = await supabase
        .from('designs')
        .update({
          params: {
            ...design.params,
            tokenConfig: config
          }
        })
        .eq('id', design.id)

      if (error) throw error
    } catch (error) {
      console.error('Error saving configuration:', error)
    }
  }

  const handleViewToken = (token: Token) => {
    if (token.algorand_tx) {
      // Determine the correct explorer URL based on network
      const isMainnet = import.meta.env.VITE_ALGORAND_NETWORK === 'mainnet'
      const explorerUrl = isMainnet 
        ? `https://algoexplorer.io/tx/${token.algorand_tx}`
        : `https://testnet.algoexplorer.io/tx/${token.algorand_tx}`
      
      // Open in new tab
      window.open(explorerUrl, '_blank', 'noopener,noreferrer')
    } else {
      // If no transaction ID, show token details in a modal or alert
      alert(`Token #${token.id.slice(-8)} created on ${new Date(token.created_at).toLocaleDateString()}`)
    }
  }

  const calculateTokenValue = () => {
    // Simple valuation based on projected yields and efficiency
    const annualValue = (simulation.fishYieldKg * 8) + (simulation.vegYieldKg * 5) // $8/kg fish, $5/kg veg
    const efficiencyMultiplier = simulation.systemEfficiency / 100
    return Math.round(annualValue * efficiencyMultiplier)
  }

  const tokenValue = calculateTokenValue()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Tokenization Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Asset Tokenization
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Convert your aquaponic system into tradeable digital assets
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-lg"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-lg"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleConfigure}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Settings className="h-4 w-4" />
              <span>Configure</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 bg-slate-50 dark:bg-slate-700 rounded-2xl">
            <TrendingUp className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Estimated Value
            </h3>
            <p className="text-3xl font-bold text-emerald-600">
              ${tokenValue.toLocaleString()}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Annual projected value
            </p>
          </div>

          <div className="text-center p-6 bg-slate-50 dark:bg-slate-700 rounded-2xl">
            <Shield className="h-8 w-8 text-teal-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Blockchain Security
            </h3>
            <p className="text-lg font-semibold text-teal-600">
              Algorand Network
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Carbon-negative blockchain
            </p>
          </div>

          <div className="text-center p-6 bg-slate-50 dark:bg-slate-700 rounded-2xl">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Fractional Ownership
            </h3>
            <p className="text-lg font-semibold text-purple-600">
              {tokens.length > 0 ? 'Active' : 'Available'}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Enable shared investment
            </p>
          </div>
        </div>

        {tokens.length === 0 ? (
          <div className="text-center py-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createToken}
              disabled={creating}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {creating ? (
                <div className="flex items-center space-x-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Creating Token...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Coins className="h-5 w-5" />
                  <span>Tokenize This System</span>
                </div>
              )}
            </motion.button>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
              Create a digital asset representing ownership in this aquaponic system
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Active Tokens
            </h3>
            {tokens.map((token, index) => (
              <motion.div
                key={token.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                      <Coins className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        Aquaponic Token #{token.id.slice(-8)}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Created {new Date(token.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {token.algorand_tx && (
                      <button
                        onClick={() => copyToClipboard(token.algorand_tx!)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-white dark:hover:bg-slate-600 transition-colors"
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span>TX ID</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleViewToken(token)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm text-emerald-600 hover:text-emerald-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
                
                {token.algorand_tx && (
                  <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-xl">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Transaction ID
                    </p>
                    <p className="text-sm font-mono text-slate-900 dark:text-white break-all">
                      {token.algorand_tx}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Benefits Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8"
      >
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          Why Tokenize Your Aquaponic System?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: DollarSign,
              title: 'Unlock Liquidity',
              description: 'Convert your physical aquaponic system into tradeable digital assets, enabling easier access to capital and investment opportunities.',
              color: 'text-emerald-600'
            },
            {
              icon: Users,
              title: 'Enable Fractional Ownership',
              description: 'Allow multiple investors to own shares of your system, spreading risk and enabling community-supported agriculture models.',
              color: 'text-teal-600'
            },
            {
              icon: Shield,
              title: 'Transparent Operations',
              description: 'Blockchain technology provides immutable records of system performance, yields, and financial transactions.',
              color: 'text-purple-600'
            },
            {
              icon: TrendingUp,
              title: 'Performance-Based Value',
              description: 'Token value can be tied to actual system performance metrics like yield, efficiency, and sustainability scores.',
              color: 'text-blue-600'
            }
          ].map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-700`}>
                <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {benefit.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6"
      >
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Important Disclaimer
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
              This tokenization feature is a demonstration of blockchain integration possibilities. 
              Actual tokenization involves complex legal, regulatory, and technical considerations. 
              Consult with legal and financial professionals before implementing real asset tokenization.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        design={design}
        tokenValue={tokenValue}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        design={design}
        simulation={simulation}
        tokens={tokens}
      />

      <ConfigureModal
        isOpen={showConfigureModal}
        onClose={() => setShowConfigureModal(false)}
        design={design}
        onSave={handleSaveConfiguration}
      />
    </div>
  )
}