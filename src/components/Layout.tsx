import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { useSubscription } from '../lib/subscription'
import { ProBadge } from './ProGate'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Waves, 
  Sun, 
  Moon, 
  Monitor, 
  LogOut, 
  User,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Menu,
  X,
  Home,
  CreditCard,
  Crown
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth()
  const { theme, setTheme, isDark } = useTheme()
  const { isPro } = useSubscription()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/wizard', icon: Home, color: 'text-emerald-600 dark:text-emerald-400' },
    { name: 'My Designs', href: '/designs', icon: LayoutDashboard, color: 'text-teal-600 dark:text-teal-400' },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart, color: 'text-emerald-600 dark:text-emerald-400' },
    { name: 'Settings', href: '/settings', icon: Settings, color: 'text-slate-600 dark:text-slate-400' },
  ]

  // Add billing to navigation for authenticated users
  if (user) {
    navigation.splice(-1, 0, {
      name: 'Billing',
      href: '/account/billing',
      icon: CreditCard,
      color: 'text-purple-600 dark:text-purple-400'
    })
  }

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  }

  const ThemeIcon = themeIcons[theme]

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={sidebarOpen ? "open" : "closed"}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-xl lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  AquaGuardian
                </span>
                <ProBadge />
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href || 
                (item.href === '/wizard' && location.pathname === '/') ||
                (item.href === '/designs' && location.pathname.startsWith('/dashboard'))
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? item.color : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-colors`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          {user && (
            <div className="border-t border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                  <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {profile?.email}
                  </p>
                  <div className="flex items-center space-x-2">
                    {profile?.role === 'admin' && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full">
                        Admin
                      </span>
                    )}
                    {isPro && (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full">
                        <Crown className="h-3 w-3" />
                        <span>Pro</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    const themes: Theme[] = ['light', 'dark', 'system']
                    const currentIndex = themes.indexOf(theme)
                    const nextTheme = themes[(currentIndex + 1) % themes.length]
                    setTheme(nextTheme)
                  }}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
                >
                  <ThemeIcon className="h-5 w-5" />
                </button>
                
                <button
                  onClick={signOut}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AquaGuardian
            </span>
            <ProBadge />
          </Link>

          {!user && (
            <Link
              to="/auth"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In
            </Link>
          )}
        </div>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}

type Theme = 'dark' | 'light' | 'system'