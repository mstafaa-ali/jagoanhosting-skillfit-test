import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import { MainLayout } from './components/layout/MainLayout';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" replace />;
}

import DashboardPage from './pages/DashboardPage';
import ResidentsPage from './pages/ResidentsPage';
import HousesPage from './pages/HousesPage';
import HouseDetailPage from './pages/HouseDetailPage';
import BillingsPage from './pages/BillingsPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/residents" element={<ProtectedRoute><ResidentsPage /></ProtectedRoute>} />
            <Route path="/houses" element={<ProtectedRoute><HousesPage /></ProtectedRoute>} />
            <Route path="/houses/:id" element={<ProtectedRoute><HouseDetailPage /></ProtectedRoute>} />
            <Route path="/billings" element={<ProtectedRoute><BillingsPage /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          </Routes>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
