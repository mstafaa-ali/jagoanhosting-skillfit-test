import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './Auth';
import Login from './Login';

// ponytail: single file layout instead of components/layout/ folder
function Layout({ children }) {
  const { logout } = useAuth();
  return (
    <div className="app-container">
      <nav className="sidebar glass-card" style={{ borderRadius: 0, borderTop: 0, borderBottom: 0, borderLeft: 0 }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--accent-color)' }}>RT Admin</h2>
        <Link to="/">Dashboard</Link>
        <Link to="/residents">Penghuni</Link>
        <button onClick={logout} className="btn-primary" style={{ marginTop: 'auto', display: 'block', width: '100%', position: 'absolute', bottom: '2rem', width: 'calc(100% - 2rem)' }}>
          Logout
        </button>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

// Minimal placeholder pages for layout testing
const Dashboard = () => <div><h2>Dashboard</h2><p>Selamat datang di sistem administrasi RT.</p></div>;
const Residents = () => <div><h2>Penghuni</h2><p>Daftar penghuni.</p></div>;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/residents" element={<ProtectedRoute><Residents /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
