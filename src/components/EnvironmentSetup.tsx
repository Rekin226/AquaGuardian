import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Database, 
  CreditCard, 
  Mic, 
  Link as LinkIcon,
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

interface EnvironmentVariable {
  key: string
  value: string
  required: boolean
  description: string
  type: 'text' | 'password' | 'url'
  service: string
  setupUrl?: string
}

const ENVIRONMENT_VARIABLES: EnvironmentVariable[] = [
  {
    key: 'VITE_SUPABASE_URL',
    value: '',
    required: true,
    description: 'Your Supabase project URL',
    type: 'url',
    service: 'Supabase',
    setupUrl: 'https://supabase.com/dashboard'
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    value: '',
    required: true,
    description: 'Your Supabase anonymous key',
    type: 'password',
    service: 'Supabase',
    setupUrl: 'https://supabase.com/dashboard'
  },
  {
    key: 'VITE_REVENUECAT_API_KEY',
    value: '',
    required: true,
    description: 'RevenueCat API key for subscriptions',
    type: 'password',
    service: 'RevenueCat',
    setupUrl: 'https://app.revenuecat.com'
  },
  {
    key: 'ELEVEN_API_KEY',
    value: '',
    required: false,
    description: 'ElevenLabs API key for voice-over generation',
    type: 'password',
    service: 'ElevenLabs',
    setupUrl: 'https://elevenlabs.io'
  }
]

export function EnvironmentSetup() {
  const [variables, setVariables] = useState<EnvironmentVariable[]>(ENVIRONMENT_VARIABLES)
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    // Check current environment variables
    const updatedVariables = variables.map(variable => ({
      ...variable,
      value: import.meta.env[variable.key] || ''
    }))
    setVariables(updatedVariables)
  }, [])

  const updateVariable = (key: string, value: string) => {
    setVariables(prev => prev.map(variable => 
      variable.key === key ? { ...variable, value } : variable
    ))
  }

  const toggleShowValue = (key: string) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const copyEnvFile = () => {
    const envContent = variables
      .map(variable => `${variable.key}=${variable.value}`)
      .join('\n')
    
    navigator.clipboard.writeText(envContent)
    setCopied('env-file')
    setTimeout(() => setCopied(null), 2000)
  }

  const getSetupStatus = () => {
    const requiredVariables = variables.filter(v => v.required)
    const configuredRequired = requiredVariables.filter(v => v.value).length
    const totalRequired = requiredVariables.length
    
    return {
      configured: configuredRequired,
      total: totalRequired,
      percentage: Math.round((configuredRequired / totalRequired) * 100),
      isComplete: configuredRequired === totalRequired
    }
  }

  const status = getSetupStatus()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Environment Setup</h1>
          <p className="text-emerald-100">
            Configure your environment variables to enable all AquaGuardian features
          </p>
          
          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Setup Progress</span>
              <span className="text-sm">{status.configured}/{status.total} configured</span>
            </div>
            <div className="w-full bg-emerald-400/30 rounded-full h-2">
              <motion.div
                className="bg-white h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${status.percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Status Alert */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-4 rounded-2xl border ${
              status.isComplete
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              {status.isComplete ? (
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              )}
              <div>
                <h3 className={`font-semibold ${
                  status.isComplete ? 'text-emerald-800 dark:text-emerald-200' : 'text-amber-800 dark:text-amber-200'
                }`}>
                  {status.isComplete ? 'Setup Complete!' : 'Setup Required'}
                </h3>
                <p className={`text-sm ${
                  status.isComplete ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
                }`}>
                  {status.isComplete 
                    ? 'All required environment variables are configured.'
                    : `${status.total - status.configured} required variables need to be configured.`
                  }
                </p>
              </div>
            </div>
          </motion.div>

          {/* Environment Variables */}
          <div className="space-y-6">
            {variables.map((variable, index) => (
              <motion.div
                key={variable.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${
                      variable.service === 'Supabase' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                      variable.service === 'RevenueCat' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      variable.service === 'ElevenLabs' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-slate-100 dark:bg-slate-700'
                    }`}>
                      {variable.service === 'Supabase' && <Database className="h-5 w-5 text-emerald-600" />}
                      {variable.service === 'RevenueCat' && <CreditCard className="h-5 w-5 text-purple-600" />}
                      {variable.service === 'ElevenLabs' && <Mic className="h-5 w-5 text-blue-600" />}
                      {!['Supabase', 'RevenueCat', 'ElevenLabs'].includes(variable.service) && <LinkIcon className="h-5 w-5 text-slate-600" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>{variable.key}</span>
                        {variable.required && (
                          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {variable.description}
                      </p>
                    </div>
                  </div>
                  
                  {variable.setupUrl && (
                    <a
                      href={variable.setupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <span>Setup {variable.service}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={variable.type === 'password' && !showValues[variable.key] ? 'password' : 'text'}
                    value={variable.value}
                    onChange={(e) => updateVariable(variable.key, e.target.value)}
                    placeholder={`Enter your ${variable.service} ${variable.key.includes('URL') ? 'URL' : 'API key'}`}
                    className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                  
                  {variable.type === 'password' && (
                    <button
                      onClick={() => toggleShowValue(variable.key)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showValues[variable.key] ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>

                {variable.value && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Configured</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Export .env File */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 p-6 bg-slate-50 dark:bg-slate-700 rounded-2xl"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Environment File Export
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Copy these environment variables to your <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">.env</code> file:
            </p>
            
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm overflow-x-auto">
              {variables.map(variable => (
                <div key={variable.key}>
                  {variable.key}={variable.value || 'your_value_here'}
                </div>
              ))}
            </div>
            
            <button
              onClick={copyEnvFile}
              className="mt-4 flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
            >
              {copied === 'env-file' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span>{copied === 'env-file' ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </motion.div>

          {/* Next Steps */}
          {status.isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl"
            >
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-4">
                🎉 Setup Complete! Next Steps:
              </h3>
              <ul className="space-y-2 text-sm text-emerald-700 dark:text-emerald-300">
                <li>• Restart your development server to load new environment variables</li>
                <li>• Test database connection by creating a new design</li>
                <li>• Verify subscription features in the billing section</li>
                <li>• Try the blockchain tokenization with a connected wallet</li>
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}