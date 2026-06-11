import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner'; 
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout'; 
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Applications from '@/pages/Applications';
import Analytics from '@/pages/Analytics'; 
import ApplicationDetail from '@/pages/ApplicationDetail';
import Navbar from './components/Navbar';
import Landing from "@/pages/Landing";
import Profile from './pages/Profile';
import { ThemeProvider } from './components/theme-provider';

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <Outlet /> {}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors closeButton />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            {/* 1. Raw Authentication Routes: Completely free of the Navbar */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 2. Public & Protected Application Views: Everything here gets the Navbar */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Landing />} />

              {/* Guarded Internal Paths */}
              <Route path="/dashboard" element={
                <ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>
              } />
              
              <Route path="/applications" element={
                <ProtectedRoute><DashboardLayout><Applications /></DashboardLayout></ProtectedRoute>
              } />

              <Route path="/applications/:id" element={
                <ProtectedRoute><DashboardLayout><ApplicationDetail /></DashboardLayout></ProtectedRoute>
              } />

              <Route path="/analytics" element={
                <ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>
              } />
              
              {/* Profile is now inside MainLayout, so it will have the Navbar */}
              <Route path="/profile" element={
                <ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}