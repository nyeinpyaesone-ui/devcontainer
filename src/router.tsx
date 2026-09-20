// Router Configuration - Defines all application routes

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import App from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <Navigate to="/dashboard" replace />
      </AuthProvider>
    ),
  },
  {
    path: '/login',
    element: (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <AuthProvider>
        <ProtectedRoute>
          <App />
        </ProtectedRoute>
      </AuthProvider>
    ),
  },
  {
    path: '*',
    element: (
      <AuthProvider>
        <Navigate to="/login" replace />
      </AuthProvider>
    ),
  },
]);
