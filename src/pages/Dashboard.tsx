import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase, Design } from '../lib/supabase'
import { simulate, SimulationResult } from '../lib/simulator'
import { 
  Fish, 
  Leaf, 
  Droplets, 
  Zap, 
  TrendingUp, 
  DollarSign,
  ArrowLeft,
  Settings,
  Download,
  Share2
} from 'lucide-react'

export function Dashboard() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [design, setDesign] = useState<Design | null>(null)
  const [simulation, setSimulation] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your aquaponic design...</p>
        </div>
      </div>
    )
  }

  if (error || !design) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Design not found'}</p>
          <Link
            to="/wizard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Create New Design
          </Link>
        </div>
      </div>
    )
  }

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    color, 
    description 
  }: {
    title: string
    value: number | string
    unit: string
    icon: React.ComponentType<any>
    color: string
    description: string
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{unit}</p>
        </div>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/designs"
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {design.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Created {new Date(design.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                <Settings className="h-4 w-4" />
                <span>Configure</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Configuration Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Farm Size</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {design.params.farmSize}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fish Species</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {design.params.fishSpecies?.join(', ') || 'None'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Crops</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {design.params.cropChoice?.join(', ') || 'None'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {design.params.budget?.replace('-', ' - $')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Energy Source</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {design.params.energySource}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {simulation && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Predicted Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                  title="Annual Fish Yield"
                  value={simulation.fishYieldKg}
                  unit="kg/year"
                  icon={Fish}
                  color="bg-blue-500"
                  description="Expected fish production based on species and system size"
                />
                <MetricCard
                  title="Annual Vegetable Yield"
                  value={simulation.vegYieldKg}
                  unit="kg/year"
                  icon={Leaf}
                  color="bg-green-500"
                  description="Expected crop production from hydroponic beds"
                />
                <MetricCard
                  title="Daily Water Usage"
                  value={simulation.dailyWaterL}
                  unit="liters/day"
                  icon={Droplets}
                  color="bg-cyan-500"
                  description="Water consumption including evaporation and plant uptake"
                />
                <MetricCard
                  title="Daily Energy Usage"
                  value={simulation.dailyKWh}
                  unit="kWh/day"
                  icon={Zap}
                  color="bg-yellow-500"
                  description="Power consumption for pumps, aeration, and lighting"
                />
                <MetricCard
                  title="System Efficiency"
                  value={simulation.systemEfficiency}
                  unit="%"
                  icon={TrendingUp}
                  color="bg-purple-500"
                  description="Overall system performance based on configuration"
                />
                <MetricCard
                  title="Monthly Operating Cost"
                  value={`$${simulation.monthlyOperatingCost}`}
                  unit="USD/month"
                  icon={DollarSign}
                  color="bg-red-500"
                  description="Estimated monthly costs for electricity, water, and feed"
                />
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Performance Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      Production Efficiency
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Your system is projected to produce {(simulation.fishYieldKg + simulation.vegYieldKg).toFixed(1)} kg 
                      of food annually with {simulation.systemEfficiency}% efficiency.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      Resource Usage
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Daily consumption: {simulation.dailyWaterL}L water, {simulation.dailyKWh} kWh electricity. 
                      Consider {design.params.energySource === 'grid' ? 'solar panels' : 'current energy setup'} for sustainability.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      Economic Viability
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Monthly operating costs of ${simulation.monthlyOperatingCost} with potential revenue 
                      from {simulation.fishYieldKg/12} kg fish and {simulation.vegYieldKg/12} kg vegetables per month.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}