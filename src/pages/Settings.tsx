import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { useSubscription } from '../lib/subscription'
import { ProBadge } from '../components/ProGate'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download,
  Trash2,
  ArrowLeft,
  Save,
  Crown,
  CreditCard
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function Settings() {
  const { user, profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { isPro } = useSubscription()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  })
  const [language, setLanguage] = useState('en')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Handle account deletion
      console.log('Account deletion requested')
    }
  }

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{title}</h3>
      {children}
    </motion.div>
  )

  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    label, 
    description 
  }: { 
    enabled: boolean
    onChange: (enabled: boolean) => void
    label: string
    description?: string 
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-medium text-slate-900 dark:text-white">{label}</div>
        {description && (
          <div className="text-sm text-slate-600 dark:text-slate-400">{description}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Link
              to="/wizard"
              className="p-3 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account */}
            <SettingSection title="Account">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                    <User className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {user?.email}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {profile?.role} account
                    </div>
                  </div>
                  <ProBadge />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue={profile?.email?.split('@')[0] || ''}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>
            </SettingSection>

            {/* Appearance */}
            <SettingSection title="Appearance">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: '☀️' },
                      { value: 'dark', label: 'Dark', icon: '🌙' },
                      { value: 'system', label: 'System', icon: '💻' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as any)}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          theme === option.value
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                        }`}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {option.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SettingSection>

            {/* Notifications */}
            <SettingSection title="Notifications">
              <div className="space-y-2">
                <ToggleSwitch
                  enabled={notifications.email}
                  onChange={(enabled) => setNotifications(prev => ({ ...prev, email: enabled }))}
                  label="Email Notifications"
                  description="Receive updates about your designs and system performance"
                />
                <ToggleSwitch
                  enabled={notifications.push}
                  onChange={(enabled) => setNotifications(prev => ({ ...prev, push: enabled }))}
                  label="Push Notifications"
                  description="Get real-time alerts on your device"
                />
                <ToggleSwitch
                  enabled={notifications.marketing}
                  onChange={(enabled) => setNotifications(prev => ({ ...prev, marketing: enabled }))}
                  label="Marketing Communications"
                  description="Receive news, tips, and product updates"
                />
              </div>
            </SettingSection>

            {/* Privacy & Security */}
            <SettingSection title="Privacy & Security">
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Download className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <div className="text-left">
                      <div className="font-medium text-slate-900 dark:text-white">
                        Export Data
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Download all your designs and data
                      </div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <div className="text-left">
                      <div className="font-medium text-red-700 dark:text-red-300">
                        Delete Account
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">
                        Permanently delete your account and all data
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </SettingSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Crown className="h-6 w-6 text-emerald-600" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Subscription
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl ${
                  isPro 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-700'
                }`}>
                  <div className="font-medium text-slate-900 dark:text-white mb-1">
                    {isPro ? 'Pro Designer' : 'Free Plan'}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {isPro ? 'All features unlocked' : 'Limited features'}
                  </div>
                </div>

                <Link
                  to="/account/billing"
                  className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{isPro ? 'Manage Billing' : 'Upgrade to Pro'}</span>
                </Link>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </motion.button>

            {/* Sign Out */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onClick={signOut}
              className="w-full text-red-600 hover:text-red-700 py-3 text-center font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}