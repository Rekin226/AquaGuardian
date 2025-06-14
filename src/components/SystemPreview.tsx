import React from 'react'
import { motion } from 'framer-motion'
import { Settings, Droplets, Zap, Gauge, Filter, Waves } from 'lucide-react'

interface SystemPreset {
  tankSize: string
  pumpRate: string
  pipeDiameter: string
  waterVolume: string
  flowRate: string
  description: string
  advantages: string[]
  considerations: string[]
  tankVol?: number
  bioFilterVol?: number
  purifierVol?: number
  sumpVol?: number
  pipeDia?: number
}

interface SystemPreviewProps {
  svgId: string
  params: SystemPreset
  onChangeSystem?: () => void
  isCustomMode?: boolean
}

const SYSTEM_PRESETS: Record<string, SystemPreset> = {
  'media-bed': {
    tankSize: '100-500L',
    pumpRate: '300-800 L/h',
    pipeDiameter: '25-32mm',
    waterVolume: '200-1000L',
    flowRate: '2-4 L/min',
    description: 'Uses gravel or expanded clay as growing medium. Water flows through the media, providing nutrients and filtration.',
    advantages: [
      'Simple and reliable',
      'Good biological filtration',
      'Suitable for beginners',
      'Low maintenance'
    ],
    considerations: [
      'Requires growing medium',
      'Heavier system weight',
      'Slower plant growth initially'
    ]
  },
  'nft': {
    tankSize: '200-800L',
    pumpRate: '400-1200 L/h',
    pipeDiameter: '75-110mm',
    waterVolume: '300-1500L',
    flowRate: '1-2 L/min per channel',
    description: 'Nutrient Film Technique uses shallow channels with a thin film of nutrient-rich water flowing past plant roots.',
    advantages: [
      'Efficient water usage',
      'Fast plant growth',
      'Easy harvesting',
      'Space efficient'
    ],
    considerations: [
      'Requires consistent power',
      'Vulnerable to pump failure',
      'Limited to smaller plants'
    ]
  },
  'dwc': {
    tankSize: '150-600L',
    pumpRate: '200-600 L/h',
    pipeDiameter: '20-25mm',
    waterVolume: '250-1200L',
    flowRate: '1-3 L/min',
    description: 'Deep Water Culture suspends plant roots directly in oxygenated nutrient solution.',
    advantages: [
      'Fastest plant growth',
      'Maximum nutrient uptake',
      'Simple design',
      'High yields'
    ],
    considerations: [
      'Requires air pump',
      'Risk of root rot',
      'Temperature sensitive'
    ]
  }
}

// Bio-filter SVG component
const BioFilter = ({ volume }: { volume: number }) => {
  const width = Math.max(20, Math.min(60, Math.pow(volume, 1/3) * 2))
  const height = width * 0.8
  
  return (
    <g>
      <rect 
        x={150} 
        y={80} 
        width={width} 
        height={height} 
        fill="#4ade80" 
        stroke="#16a34a" 
        strokeWidth="2" 
        rx="4"
      />
      <text x={150 + width/2} y={80 + height/2} textAnchor="middle" fontSize="8" fill="#166534">
        Bio
      </text>
      <text x={150 + width/2} y={80 + height/2 + 10} textAnchor="middle" fontSize="6" fill="#166534">
        {volume}L
      </text>
    </g>
  )
}

// Purifier SVG component
const Purifier = ({ volume }: { volume: number }) => {
  const width = Math.max(15, Math.min(50, Math.pow(volume, 1/3) * 1.8))
  const height = width * 0.9
  
  return (
    <g>
      <rect 
        x={220} 
        y={85} 
        width={width} 
        height={height} 
        fill="#06b6d4" 
        stroke="#0891b2" 
        strokeWidth="2" 
        rx="4"
      />
      <circle cx={220 + width/2} cy={85 + height/2} r="3" fill="#0891b2" />
      <text x={220 + width/2} y={85 + height + 15} textAnchor="middle" fontSize="6" fill="#0e7490">
        Purifier {volume}L
      </text>
    </g>
  )
}

export function SystemPreview({ svgId, params, onChangeSystem, isCustomMode = false }: SystemPreviewProps) {
  const preset = SYSTEM_PRESETS[svgId] || SYSTEM_PRESETS['media-bed']

  return (
    <div className="space-y-6">
      {/* Enhanced SVG Preview with Bio-filter and Purifier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            System Design
          </h3>
          {onChangeSystem && (
            <button
              onClick={onChangeSystem}
              className="flex items-center space-x-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Change System</span>
            </button>
          )}
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img 
              src={`/svg/${svgId}.svg`} 
              alt={`${svgId} aquaponic system`}
              className="max-w-full h-auto rounded-xl border border-slate-200 dark:border-slate-600"
            />
            
            {/* Overlay Bio-filter and Purifier if custom volumes are provided */}
            {(params.bioFilterVol || params.purifierVol) && (
              <svg 
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                viewBox="0 0 300 200"
              >
                {params.bioFilterVol && <BioFilter volume={params.bioFilterVol} />}
                {params.purifierVol && <Purifier volume={params.purifierVol} />}
              </svg>
            )}
          </div>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {preset.description}
        </p>
      </motion.div>

      {/* Enhanced System Specifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            System Specifications
          </h3>
          {isCustomMode && (
            <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-1 rounded-full">
              Custom Configuration
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Droplets className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Tank Volume</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {params.tankVol ? `${params.tankVol}L` : preset.tankSize}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Filter className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Bio-Filter Volume</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {params.bioFilterVol ? `${params.bioFilterVol}L` : '50-150L'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Waves className="h-4 w-4 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Purifier Volume</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {params.purifierVol ? `${params.purifierVol}L` : '30-100L'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Droplets className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Sump Volume</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {params.sumpVol ? `${params.sumpVol}L` : '100-400L'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <Gauge className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Pipe Diameter</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {params.pipeDia ? `${params.pipeDia}mm` : preset.pipeDiameter}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Zap className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Pump Rate</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{preset.pumpRate}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Advantages & Considerations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          System Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
              Advantages
            </h4>
            <ul className="space-y-2">
              {preset.advantages.map((advantage, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{advantage}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-3">
              Considerations
            </h4>
            <ul className="space-y-2">
              {preset.considerations.map((consideration, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{consideration}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}