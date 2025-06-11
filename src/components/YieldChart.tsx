import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { motion } from 'framer-motion'

interface YieldChartProps {
  fishYieldKg: number
  vegYieldKg: number
  dailyWaterL: number
}

export function YieldChart({ fishYieldKg, vegYieldKg, dailyWaterL }: YieldChartProps) {
  const data = useMemo(() => {
    const days = 30
    const dailyFishYield = fishYieldKg / 365
    const dailyVegYield = vegYieldKg / 365
    
    return Array.from({ length: days }, (_, i) => {
      const day = i + 1
      const cumulativeFish = dailyFishYield * day
      const cumulativeVeg = dailyVegYield * day
      const cumulativeWater = dailyWaterL * day
      
      // Add some realistic variance
      const variance = 0.1
      const fishVariance = 1 + (Math.random() - 0.5) * variance
      const vegVariance = 1 + (Math.random() - 0.5) * variance
      const waterVariance = 1 + (Math.random() - 0.5) * variance * 0.5
      
      return {
        day,
        fish: Number((cumulativeFish * fishVariance).toFixed(2)),
        vegetables: Number((cumulativeVeg * vegVariance).toFixed(2)),
        water: Number((cumulativeWater * waterVariance).toFixed(0)),
      }
    })
  }, [fishYieldKg, vegYieldKg, dailyWaterL])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            Day {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'water' ? 'L' : 'kg'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          30-Day Cumulative Performance
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Projected yield and water consumption over time
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="fishGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="vegGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-600" />
            <XAxis 
              dataKey="day" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="fish"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#fishGradient)"
              name="Fish Yield"
            />
            <Area
              type="monotone"
              dataKey="vegetables"
              stroke="#14b8a6"
              strokeWidth={3}
              fill="url(#vegGradient)"
              name="Vegetable Yield"
            />
            <Area
              type="monotone"
              dataKey="water"
              stroke="#64748b"
              strokeWidth={2}
              fill="url(#waterGradient)"
              name="Water Usage"
              yAxisId="water"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-slate-600 dark:text-slate-400">Fish Yield (kg)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
          <span className="text-slate-600 dark:text-slate-400">Vegetable Yield (kg)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
          <span className="text-slate-600 dark:text-slate-400">Water Usage (L)</span>
        </div>
      </div>
    </motion.div>
  )
}