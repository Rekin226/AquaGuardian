import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import { SubscriptionProvider } from './lib/subscription';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Wizard } from './pages/Wizard';
import { Marketplace } from './pages/Marketplace';
import { Settings } from './pages/Settings';
import { Billing } from './pages/Billing';

const queryClient = new QueryClient();

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/wizard" : "/auth"} replace />} />
        <Route path="/wizard" element={user ? <Wizard /> : <Navigate to="/auth" replace />} />
        <Route path="/dashboard/:id" element={user ? <Dashboard /> : <Navigate to="/auth" replace />} />
        <Route path="/marketplace" element={user ? <Marketplace /> : <Navigate to="/auth" replace />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/auth" replace />} />
        <Route path="/account/billing" element={user ? <Billing /> : <Navigate to="/auth" replace />} />
        <Route path="/auth" element={<div className="p-8 text-center">Auth page coming soon</div>} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <Router>
              <AuthenticatedApp />
            </Router>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;