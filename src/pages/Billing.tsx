import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { useSubscription } from '../lib/subscription'
import { SubscriptionManager } from '../components/SubscriptionManager'
import { CustomBudgetInput } from '../components/CustomBudgetInput'
import { ProBadge } from '../components/ProGate'
import { 
  Crown, 
  CreditCard, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Download,
  FileText,
  Receipt,
  DollarSign,
  Calculator
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

export function Billing() {
  const { user, profile } = useAuth()
  const { isPro } = useSubscription()
  const [searchParams] = useSearchParams()
  const [showInvoices, setShowInvoices] = useState(false)
  const [activeTab, setActiveTab] = useState<'subscription' | 'budget'>('subscription')

  // Check for success/cancel parameters from Stripe redirect
  const paymentSuccess = searchParams.get('success') === 'true'
  const paymentCanceled = searchParams.get('canceled') === 'true'

  // Mock invoice data
  const invoices = [
    {
      id: 'inv_1234567890',
      date: '2024-01-15',
      amount: 9.00,
      status: 'paid',
      description: 'Pro Designer Monthly Subscription',
      downloadUrl: '#'
    },
    {
      id: 'inv_0987654321',
      date: '2023-12-15',
      amount: 9.00,
      status: 'paid',
      description: 'Pro Designer Monthly Subscription',
      downloadUrl: '#'
    },
    {
      id: 'inv_1122334455',
      date: '2023-11-15',
      amount: 9.00,
      status: 'paid',
      description: 'Pro Designer Monthly Subscription',
      downloadUrl: '#'
    }
  ]

  const handleBudgetSave = (amount: number, currency: string) => {
    // Budget saved successfully - the CustomBudgetInput component handles the actual saving
    console.log('Budget saved:', amount, currency)
  }

  const handleBudgetClear = () => {
    // Budget cleared successfully
    console.log('Budget cleared')
  }

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
                Billing & Budget
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your subscription and project budget
              </p>
            </div>
          </div>
        </motion.div>

        {/* Success/Cancel Messages */}
        {paymentSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-3"
          >
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-800 dark:text-emerald-200">
                Payment Successful!
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Your Pro Designer subscription is now active. Welcome to the premium experience!
              </p>
            </div>
          </motion.div>
        )}

        {paymentCanceled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center space-x-3"
          >
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Payment Canceled
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Your payment was canceled. You can try again anytime to upgrade to Pro Designer.
              </p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-700 inline-flex">
            <button
              onClick={() => setActiveTab('subscription')}
              className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'subscription'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4" />
                <span>Subscription</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'budget'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Project Budget</span>
              </div>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'subscription' ? (
              <SubscriptionManager />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <CustomBudgetInput
                  onSave={handleBudgetSave}
                  onClear={handleBudgetClear}
                />
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Account Summary
                  </h3>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Email</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {user?.email}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Plan</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {isPro ? 'Pro Designer' : 'Free'}
                    </span>
                    <ProBadge />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Role</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                    {profile?.role}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('budget')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                    activeTab === 'budget' 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Calculator className="h-4 w-4" />
                  <span className="text-sm font-medium">Set Project Budget</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                    activeTab === 'subscription' 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Crown className="h-4 w-4" />
                  <span className="text-sm font-medium">Manage Subscription</span>
                </button>
              </div>
            </motion.div>

            {/* Billing History */}
            {activeTab === 'subscription' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
                      <Receipt className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Billing History
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowInvoices(!showInvoices)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    {showInvoices ? 'Hide' : 'View All'}
                  </button>
                </div>
                
                {isPro ? (
                  <div className="space-y-3">
                    {(showInvoices ? invoices : invoices.slice(0, 2)).map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            ${invoice.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {new Date(invoice.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
                            Paid
                          </span>
                          <button
                            onClick={() => window.open(invoice.downloadUrl, '_blank')}
                            className="p-1 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No billing history available. Upgrade to Pro to see your invoices here.
                  </p>
                )}
              </motion.div>
            )}

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Need Help?
              </h3>
              <div className="space-y-3">
                <a
                  href="mailto:billing@aquaguardian.green"
                  className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <span>Contact Billing Support</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="/terms"
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Terms of Service</span>
                </a>
                <a
                  href="/privacy"
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Privacy Policy</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}