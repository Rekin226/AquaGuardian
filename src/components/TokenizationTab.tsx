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
  Loader
} from 'lucide-react'

interface TokenizationTabProps {
  design: Design
  simulation: SimulationResult
}

export function TokenizationTab({ design, simulation }: TokenizationTabProps) {
  const { user } = useAuth()
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)

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
        <div className="flex items-center space-x-3 mb-6">
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
                    <button className="flex items-center space-x-1 px-3 py-2 text-sm text-emerald-600 hover:text-emerald-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
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
    </div>
  )
}