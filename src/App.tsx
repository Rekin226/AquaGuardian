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
import { Auth } from './pages/Auth';

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
    <Routes>
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/wizard" replace />} />
      <Route path="/" element={<Navigate to={user ? "/wizard" : "/auth"} replace />} />
      
      {/* Protected Routes */}
      {user ? (
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/wizard" element={<Wizard />} />
              <Route path="/dashboard/:id" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/account/billing" element={<Billing />} />
            </Routes>
          </Layout>
        } />
      ) : (
        <Route path="/*" element={<Navigate to="/auth" replace />} />
      )}
    </Routes>
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