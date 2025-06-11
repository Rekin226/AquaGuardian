import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { useSubscription } from '../lib/subscription'
import { supabase, Design } from '../lib/supabase'
import { simulate } from '../lib/simulator'
import { ProGate } from '../components/ProGate'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Fish, 
  Leaf, 
  Droplets,
  Zap,
  DollarSign,
  Eye,
  Heart,
  Share2,
  Crown
} from 'lucide-react'

interface MarketplaceDesign extends Design {
  simulation?: any
  views?: number
  likes?: number
}

export function Marketplace() {
  const { user } = useAuth()
  const { isPro } = useSubscription()
  const [designs, setDesigns] = useState<MarketplaceDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'fish' | 'crops' | 'efficiency'>('all')

  useEffect(() => {
    fetchMarketplaceDesigns()
  }, [])

  const fetchMarketplaceDesigns = async () => {
    try {
      // In a real app, this would fetch public designs from other users
      // For demo, we'll show some sample designs
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .limit(12)

      if (error) throw error

      const designsWithSimulations = data.map(design => ({
        ...design,
        simulation: simulate(design.params),
        views: Math.floor(Math.random() * 1000) + 50,
        likes: Math.floor(Math.random() * 100) + 5
      }))

      setDesigns(designsWithSimulations)
    } catch (error) {
      console.error('Error fetching marketplace designs:', error)
    } finally {
      setLoading(false)
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
      case 'fish':
        return design.params.fishSpecies && design.params.fishSpecies.length > 0
      case 'crops':
        return design.params.cropChoice && design.params.cropChoice.length > 0
      case 'efficiency':
        return design.simulation?.systemEfficiency > 80
      default:
        return true
    }
  })

  const DesignCard = ({ design }: { design: MarketplaceDesign }) => (
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
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2">
            {design.name}
          </h3>
          {design.simulation?.systemEfficiency > 90 && (
            <div className="flex items-center space-x-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full text-xs">
              <Crown className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{design.views}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4" />
            <span>{design.likes}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <Fish className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              <AnimatedCounter value={design.simulation?.fishYieldKg || 0} decimals={1} />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">kg fish/year</div>
          </div>
          
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <Leaf className="h-5 w-5 text-teal-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              <AnimatedCounter value={design.simulation?.vegYieldKg || 0} decimals={1} />
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
              {design.simulation?.dailyWaterL || 0}L
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">daily</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center space-x-1 text-yellow-600 mb-1">
              <Zap className="h-4 w-4" />
            </div>
            <div className="font-medium text-slate-900 dark:text-white">
              {design.simulation?.dailyKWh || 0}kWh
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">daily</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="font-medium text-slate-900 dark:text-white">
              {design.simulation?.systemEfficiency || 0}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">efficiency</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700 flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {design.params.farmSize} • {design.params.energySource}
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors">
            <Heart className="h-4 w-4" />
          </button>
          <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors">
            <Share2 className="h-4 w-4" />
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
          <p className="text-slate-600 dark:text-slate-400">Loading marketplace...</p>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Design Marketplace
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Discover and share aquaponic system designs from the community
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
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
                <option value="fish">Fish Systems</option>
                <option value="crops">Crop Systems</option>
                <option value="efficiency">High Efficiency</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Pro Gate for Advanced Features */}
        <ProGate 
          feature="advanced marketplace filters and analytics"
          fallback={
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl"
            >
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
                    Unlock Pro Marketplace Features
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Advanced filters, detailed analytics, and design comparison tools
                  </p>
                </div>
              </div>
            </motion.div>
          }
        >
          {/* Advanced analytics would go here for Pro users */}
          <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Pro Analytics Dashboard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="text-2xl font-bold text-emerald-600">
                  <AnimatedCounter value={filteredDesigns.length} />
                </div>
                <div className="text-sm text-emerald-700 dark:text-emerald-300">Total Designs</div>
              </div>
              <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                <div className="text-2xl font-bold text-teal-600">
                  <AnimatedCounter value={Math.round(filteredDesigns.reduce((acc, d) => acc + (d.simulation?.systemEfficiency || 0), 0) / filteredDesigns.length) || 0} />%
                </div>
                <div className="text-sm text-teal-700 dark:text-teal-300">Avg Efficiency</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">
                  <AnimatedCounter value={filteredDesigns.reduce((acc, d) => acc + (d.views || 0), 0)} />
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Total Views</div>
              </div>
              <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                <div className="text-2xl font-bold text-rose-600">
                  <AnimatedCounter value={filteredDesigns.reduce((acc, d) => acc + (d.likes || 0), 0)} />
                </div>
                <div className="text-sm text-rose-700 dark:text-rose-300">Total Likes</div>
              </div>
            </div>
          </div>
        </ProGate>

        {/* Design Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
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

        {filteredDesigns.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No designs found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search terms or filters
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}