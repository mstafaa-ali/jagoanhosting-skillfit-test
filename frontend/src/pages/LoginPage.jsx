import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Sun, Moon, Mail, Lock, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      toast.success("Login berhasil");
      navigate('/');
    } else {
      toast.error('Login gagal. Periksa kembali email dan password Anda.');
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Left Pane - Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-emerald-900 overflow-hidden">
        {/* Background Pattern/Image */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-emerald-800 to-slate-900"></div>
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
          alt="Office/Building"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
        />

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg border border-emerald-400/30">
                RT
              </div>
              <span className="text-3xl font-bold tracking-tight">SistemAdmin</span>
            </div>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white drop-shadow-sm">
              Manajemen RT Digital yang Modern & Efisien.
            </h1>
            <p className="text-emerald-50 text-lg leading-relaxed">
              Kelola data warga, pembayaran iuran, dan laporan keuangan.
            </p>

          </div>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all duration-200 shadow-sm border border-slate-200 dark:border-slate-700"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo (Visible only on mobile) */}
            <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-lg">
                RT
              </div>
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">SistemAdmin</span>
            </div>

            <div className="text-center lg:text-left space-y-3">
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Selamat Datang</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">Masuk ke akun administrator Anda untuk melanjutkan.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-10">
              <div className="space-y-5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm"
                    placeholder="Alamat Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm"
                    placeholder="Kata Sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold text-lg shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0">
                Masuk ke Dashboard
              </Button>
            </form>

            <div className="pt-8">
              <p className="text-center text-sm text-slate-500 dark:text-slate-500 font-medium">
                Sistem Informasi Manajemen Rukun Tetangga &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
