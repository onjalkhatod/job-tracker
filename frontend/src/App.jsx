import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner'; 
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout'; 
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Applications from '@/pages/Applications';
import Analytics from '@/pages/Analytics'; 
import ApplicationDetail from '@/pages/ApplicationDetail'; 

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors closeButton />

      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
          <Navbar />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

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

            {/* ➕ 2. Register the dynamic dynamic parameter matcher layout engine here */}
            <Route path="/applications/:id" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ApplicationDetail />
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