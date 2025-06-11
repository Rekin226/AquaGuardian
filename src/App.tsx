import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Wizard } from './pages/Wizard';

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
          <Router>
            <AuthenticatedApp />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;