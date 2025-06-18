import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useSubscription } from '../lib/subscription'
import { supabase, Design } from '../lib/supabase'
import { simulate, SimulationResult } from '../lib/simulator'
import { ProGate } from '../components/ProGate'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import { getClimateEmoji, CLIMATE_PRESETS } from '../data/climate'
import { 
  Plus, 
  Search, 
  Filter, 
  Fish, 
  Leaf, 
  Droplets,
  Zap,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Settings,
  Crown,
  Loader
} from 'lucide-react'

interface DesignWithSimulation extends Design {
  simulation: SimulationResult
}

export function MyDesignsPage() {
  const { user } = useAuth()
  const { isPro } = useSubscription()
  const [designs, setDesigns] = useState<DesignWithSimulation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'efficient' | 'custom'>('all')
  const [error, setError] = useState<string | null>(null)
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    designId: string | null
    designName: string
    loading: boolean
  }>({
    isOpen: false,
    designId: null,
    designName: '',
    loading: false
  })

  useEffect(() => {
    if (user) {
      fetchMyDesigns()
    }
  }, [user])

  const fetchMyDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Run simulations for each design
      const designsWithSimulations = data.map(design => ({
        ...design,
        simulation: simulate(design.params)
      }))

      setDesigns(designsWithSimulations)
    } catch (error) {
      console.error('Error fetching designs:', error)
      setError('Failed to load your designs')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDesign = (designId: string, designName: string) => {
    setConfirmDialog({
      isOpen: true,
      designId,
      designName,
      loading: false
    })
  }

  const confirmDeleteDesign = async () => {
    if (!confirmDialog.designId) return

    setConfirmDialog(prev => ({ ...prev, loading: true }))

    try {
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', confirmDialog.designId)
        .eq('user_id', user?.id) // Extra security check

      if (error) throw error

      setDesigns(prev => prev.filter(design => design.id !== confirmDialog.designId))
      
      // Close dialog after successful deletion
      setTimeout(() => {
        setConfirmDialog({
          isOpen: false,
          designId: null,
          designName: '',
          loading: false
        })
      }, 500)
    } catch (error) {
      console.error('Error deleting design:', error)
      setConfirmDialog(prev => ({ ...prev, loading: false }))
      alert('Failed to delete design. Please try again.')
    }
  }

  const closeConfirmDialog = () => {
    if (!confirmDialog.loading) {
      setConfirmDialog({
        isOpen: false,
        designId: null,
        designName: '',
        loading: false
      })
    }
  }

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.params.fishSpecies?.some(fish => 
                           fish.toLowerCase().includes(searchTerm.toLowerCase())
                         ) ||
                         design.params.cropChoice?.some(crop => 
                           crop.toLowerCase().includes(searchTerm.toLowerCase())
                         )

    if (!matchesSearch) return false

    switch (filterBy) {
      case 'recent':
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(design.created_at) > weekAgo
      case 'efficient':
        return design.simulation.systemEfficiency > 85
      case 'custom':
        return design.params.mode === 'custom'
      default:
        return true
    }
  })

  const DesignCard = ({ design }: { design: DesignWithSimulation }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2">
              {design.name}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(design.created_at).toLocaleDateString()}</span>
              </div>
              {design.simulation.climateKey && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {getClimateEmoji(design.simulation.climateKey)} {CLIMATE_PRESETS[design.simulation.climateKey].label}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {design.params.mode === 'custom' && (
              <span className="inline-flex items-center space-x-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs">
                <Settings className="h-3 w-3" />
                <span>Custom</span>
              </span>
            )}
            {design.simulation.systemEfficiency > 90 && (
              <span className="inline-flex items-center space-x-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full text-xs">
                <Crown className="h-3 w-3" />
                <span>High Efficiency</span>
              </span>
            )}
          </div>
        </div>
        
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium">{design.params.systemType?.toUpperCase()}</span> • 
          <span className="ml-1">{design.params.farmSize}</span>
          {design.params.customFarmSize && (
            <span className="ml-1">({design.params.customFarmSize} m²)</span>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <Fish className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              <AnimatedCounter value={design.simulation.fishYieldKg} decimals={1} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">kg fish/year</div>
          </div>
          
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <Leaf className="h-5 w-5 text-teal-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              <AnimatedCounter value={design.simulation.vegYieldKg} decimals={1} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">kg crops/year</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <div className="flex items-center justify-center space-x-1 text-cyan-600 mb-1">
              <Droplets className="h-4 w-4" />
            </div>
            <div className="font-medium text-slate-900 dark:text-white">
              {design.simulation.dailyWaterL}L
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">daily</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center space-x-1 text-yellow-600 mb-1">
              <Zap className="h-4 w-4" />
            </div>
            <div className="font-medium text-slate-900 dark:text-white">
              {design.simulation.dailyKWh}kWh
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">daily</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="font-medium text-slate-900 dark:text-white">
              {design.simulation.systemEfficiency}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">efficiency</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700 flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {design.params.fishSpecies?.length || 0} fish species • {design.params.cropChoice?.length || 0} crops
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/dashboard/${design.id}`}
            className="flex items-center space-x-1 px-3 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </Link>
          <button
            onClick={() => handleDeleteDesign(design.id, design.name)}
            className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your designs...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchMyDesigns}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                My Designs
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Manage and view your aquaponic system designs
              </p>
            </div>
            <Link
              to="/wizard"
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>New Design</span>
            </Link>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              <AnimatedCounter value={designs.length} />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Designs</div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">
              <AnimatedCounter 
                value={designs.reduce((acc, d) => acc + d.simulation.systemEfficiency, 0) / (designs.length || 1)} 
                decimals={0}
                suffix="%"
              />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Avg Efficiency</div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              <AnimatedCounter 
                value={designs.reduce((acc, d) => acc + d.simulation.fishYieldKg, 0)} 
                decimals={0}
                suffix="kg"
              />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Fish Yield</div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-rose-600 mb-2">
              <AnimatedCounter 
                value={designs.reduce((acc, d) => acc + d.simulation.vegYieldKg, 0)} 
                decimals={0}
                suffix="kg"
              />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Crop Yield</div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search designs, fish species, crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="pl-12 pr-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors appearance-none"
              >
                <option value="all">All Designs</option>
                <option value="recent">Recent (7 days)</option>
                <option value="efficient">High Efficiency (85%+)</option>
                <option value="custom">Custom Systems</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Pro Gate for Advanced Features */}
        <ProGate 
          feature="advanced design analytics and comparison tools"
          fallback={
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl"
            >
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
                    Unlock Pro Design Features
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Advanced analytics, design comparison, and bulk operations
                  </p>
                </div>
              </div>
            </motion.div>
          }
        >
          {/* Pro analytics would go here */}
          <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Pro Design Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="text-2xl font-bold text-emerald-600">
                  <AnimatedCounter value={designs.filter(d => d.params.mode === 'custom').length} />
                </div>
                <div className="text-sm text-emerald-700 dark:text-emerald-300">Custom Systems</div>
              </div>
              <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                <div className="text-2xl font-bold text-teal-600">
                  <AnimatedCounter value={designs.filter(d => d.simulation.systemEfficiency > 90).length} />
                </div>
                <div className="text-sm text-teal-700 dark:text-teal-300">High Efficiency</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">
                  <AnimatedCounter 
                    value={designs.reduce((acc, d) => acc + d.simulation.monthlyOperatingCost, 0)} 
                    prefix="$"
                  />
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Total Monthly Cost</div>
              </div>
            </div>
          </div>
        </ProGate>

        {/* Designs Grid */}
        {filteredDesigns.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDesigns.map((design, index) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <DesignCard design={design} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            {designs.length === 0 ? (
              <div>
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No designs yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Create your first aquaponic system design to get started
                </p>
                <Link
                  to="/wizard"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Your First Design</span>
                </Link>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No designs found
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Custom Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmDeleteDesign}
        title="Delete Design"
        message={`Are you sure you want to delete "${confirmDialog.designName}"? This action cannot be undone and will permanently remove all associated data.`}
        confirmText="Delete Design"
        cancelText="Keep Design"
        variant="danger"
        loading={confirmDialog.loading}
      />
    </div>
  )
}