import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase, Design } from '../lib/supabase'
import { simulate, SimulationResult } from '../lib/simulator'
import { TokenizationTab } from '../components/TokenizationTab'
import { SystemPreview } from '../components/SystemPreview'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { YieldChart } from '../components/YieldChart'
import { motion } from 'framer-motion'
import { 
  Fish, 
  Leaf, 
  Droplets, 
  Zap, 
  TrendingUp, 
  DollarSign,
  ArrowLeft,
  Coins,
  Activity,
  Target,
  Eye
} from 'lucide-react'

export function Dashboard() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [design, setDesign] = useState<Design | null>(null)
  const [simulation, setSimulation] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'system' | 'tokenization'>('overview')

  useEffect(() => {
    if (id && user) {
      fetchDesign()
    }
  }, [id, user])

  const fetchDesign = async () => {
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setDesign(data)
      
      // Run simulation with design parameters
      const simulationResult = simulate(data.params)
      setSimulation(simulationResult)
    } catch (err) {
      console.error('Error fetching design:', err)
      setError('Failed to load design')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeSystem = () => {
    // Navigate back to wizard to change system type
    window.location.href = '/wizard'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your aquaponic design...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !design) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Design not found'}</p>
          <Link
            to="/wizard"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Create New Design
          </Link>
        </motion.div>
      </div>
    )
  }

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    gradient, 
    description,
    delay = 0
  }: {
    title: string
    value: number | string
    unit: string
    icon: React.ComponentType<any>
    gradient: string
    description: string
    delay?: number
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${gradient}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <AnimatedCounter
            value={typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]/g, ''))}
            decimals={typeof value === 'number' && value % 1 !== 0 ? 1 : 0}
            prefix={typeof value === 'string' && value.includes('$') ? '$' : ''}
            className="text-3xl font-bold text-slate-900 dark:text-white"
          />
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{unit}</p>
        </div>
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Removed redundant Share/Export/Configure buttons */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/wizard"
                className="p-3 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {design.name}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {design.params.systemType?.toUpperCase()} System • {design.params.mode === 'custom' ? 'Custom' : 'Quick'} Setup • Created {new Date(design.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {/* Removed the redundant action buttons from here */}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-700 inline-flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'system'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>System Preview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tokenization')}
              className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'tokenization'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Coins className="h-4 w-4" />
                <span>Tokenization</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'overview' && simulation && (
          <>
            {/* System Configuration Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8 border border-slate-200 dark:border-slate-700"
            >
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
                <Target className="h-6 w-6 text-emerald-600" />
                <span>System Configuration</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                {[
                  { label: 'System Type', value: design.params.systemType?.toUpperCase() || 'Not specified' },
                  { label: 'Configuration', value: design.params.mode === 'custom' ? 'Custom' : 'Quick Setup' },
                  { label: 'Farm Size', value: design.params.farmSize },
                  { label: 'Fish Species', value: design.params.fishSpecies?.join(', ') || 'None' },
                  { label: 'Crops', value: design.params.cropChoice?.join(', ') || 'None' },
                  { label: 'Energy Source', value: design.params.energySource }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl"
                  >
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{item.label}</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                      {item.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Performance Metrics */}
            <div className="mb-8">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-3xl font-semibold text-slate-900 dark:text-white mb-6"
              >
                Predicted Performance
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                  title="Annual Fish Yield"
                  value={simulation.fishYieldKg}
                  unit="kg/year"
                  icon={Fish}
                  gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
                  description="Expected fish production based on species and system size"
                  delay={0.1}
                />
                <MetricCard
                  title="Annual Vegetable Yield"
                  value={simulation.vegYieldKg}
                  unit="kg/year"
                  icon={Leaf}
                  gradient="bg-gradient-to-br from-teal-500 to-teal-600"
                  description="Expected crop production from hydroponic beds"
                  delay={0.2}
                />
                <MetricCard
                  title="Daily Water Usage"
                  value={simulation.dailyWaterL}
                  unit="liters/day"
                  icon={Droplets}
                  gradient="bg-gradient-to-br from-cyan-500 to-cyan-600"
                  description="Water consumption including evaporation and plant uptake"
                  delay={0.3}
                />
                <MetricCard
                  title="Daily Energy Usage"
                  value={simulation.dailyKWh}
                  unit="kWh/day"
                  icon={Zap}
                  gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
                  description="Power consumption for pumps, aeration, and lighting"
                  delay={0.4}
                />
                <MetricCard
                  title="System Efficiency"
                  value={simulation.systemEfficiency}
                  unit="%"
                  icon={TrendingUp}
                  gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                  description="Overall system performance based on configuration"
                  delay={0.5}
                />
                <MetricCard
                  title="Monthly Operating Cost"
                  value={`$${simulation.monthlyOperatingCost}`}
                  unit="USD/month"
                  icon={DollarSign}
                  gradient="bg-gradient-to-br from-red-500 to-red-600"
                  description="Estimated monthly costs for electricity, water, and feed"
                  delay={0.6}
                />
              </div>
            </div>

            {/* Yield Chart */}
            <YieldChart 
              fishYieldKg={simulation.fishYieldKg}
              vegYieldKg={simulation.vegYieldKg}
              dailyWaterL={simulation.dailyWaterL}
            />

            {/* Performance Insights */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 mt-8"
            >
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
                Performance Insights
              </h3>
              <div className="space-y-6">
                {[
                  {
                    title: 'Production Efficiency',
                    description: `Your ${design.params.systemType?.toUpperCase()} system is projected to produce ${(simulation.fishYieldKg + simulation.vegYieldKg).toFixed(1)} kg of food annually with ${simulation.systemEfficiency}% efficiency.`,
                    color: 'bg-emerald-500'
                  },
                  {
                    title: 'Resource Usage',
                    description: `Daily consumption: ${simulation.dailyWaterL}L water, ${simulation.dailyKWh} kWh electricity. Consider ${design.params.energySource === 'grid' ? 'solar panels' : 'current energy setup'} for sustainability.`,
                    color: 'bg-teal-500'
                  },
                  {
                    title: 'Economic Viability',
                    description: `Monthly operating costs of $${simulation.monthlyOperatingCost} with potential revenue from ${(simulation.fishYieldKg/12).toFixed(1)} kg fish and ${(simulation.vegYieldKg/12).toFixed(1)} kg vegetables per month.`,
                    color: 'bg-slate-500'
                  }
                ].map((insight, index) => (
                  <motion.div
                    key={insight.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className={`flex-shrink-0 w-3 h-3 ${insight.color} rounded-full mt-2`}></div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-semibold mb-1">
                        {insight.title}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {activeTab === 'system' && (
          <SystemPreview 
            svgId={design.params.systemType || 'media-bed'} 
            params={{
              tankSize: '100-500L',
              pumpRate: '300-800 L/h',
              pipeDiameter: '25-32mm',
              waterVolume: '200-1000L',
              flowRate: '2-4 L/min',
              description: 'System specifications based on your configuration',
              advantages: [],
              considerations: [],
              tankVol: design.params.tankVol,
              bioFilterVol: design.params.bioFilterVol,
              purifierVol: design.params.purifierVol,
              sumpVol: design.params.sumpVol,
              pipeDia: design.params.pipeDia
            }}
            onChangeSystem={handleChangeSystem}
            isCustomMode={design.params.mode === 'custom'}
          />
        )}

        {activeTab === 'tokenization' && simulation && (
          <TokenizationTab design={design} simulation={simulation} />
        )}
      </div>
    </div>
  )
}