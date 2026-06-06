import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout'; 
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Applications from '@/pages/Applications';
import Analytics from '@/pages/Analytics'; 

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* GLOBAL HIERARCHY FRAME: This keeps the navbar fixed beautifully at the top level */}
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
          <Navbar />
          
          {/* Main viewport segment */}
          <Routes>
            {/* Public Entry Gateways */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Secure Console Routes: Wrapped inside the sidebar framework beneath the navbar */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/applications" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Applications />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/analytics" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Analytics />
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}