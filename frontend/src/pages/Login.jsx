import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.token && res.data.user) {
        login(res.data.user, res.data.token);
        if (res.data.user.role === 'educator') {
          navigate('/educator');
        } else if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const mockGooglePayload = {
        email: email || `educator.user_${Date.now()}@gmail.com`,
        name: 'Educator User',
        googleId: 'g_' + Date.now(),
      };

      const res = await api.post('/auth/google', mockGooglePayload);
      if (res.data.token && res.data.user) {
        login(res.data.user, res.data.token);
        if (res.data.user.role === 'educator') {
          navigate('/educator');
        } else if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main role="main" className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-amber-200/60 mt-10 font-lexend">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Log In to Aarohan</h2>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-xs sm:text-sm mb-4 font-bold" role="alert">{error}</div>}

      {/* FEATURE 3: Google Sign-In Option */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        aria-label="Sign in with Google OAuth Account"
        className="w-full mb-4 flex items-center justify-center gap-3 bg-white border-2 border-slate-300 hover:bg-amber-50 text-slate-800 font-bold py-2.5 px-4 rounded-lg transition shadow-sm focus:ring-2 focus:ring-[#C4623A]"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        Sign in with Google
      </button>

      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-slate-200"></div>
        <span className="px-3 text-xs text-slate-700 font-bold uppercase">Or with Email</span>
        <div className="flex-1 border-t border-slate-200"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-bold text-slate-900 mb-1">Email Address</label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-amber-300 rounded-md text-sm text-slate-900 bg-amber-50/40 focus:ring-2 focus:ring-[#C4623A] focus:outline-none font-medium"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-bold text-slate-900 mb-1">Password</label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-amber-300 rounded-md text-sm text-slate-900 bg-amber-50/40 focus:ring-2 focus:ring-[#C4623A] focus:outline-none font-medium"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#C4623A] hover:bg-[#AA4E28] text-white font-bold py-2.5 rounded-lg transition shadow-sm focus:ring-2 focus:ring-[#C4623A]"
          style={{ backgroundColor: '#C4623A', color: '#FFFFFF' }}
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-700 mt-4 font-medium">
        Don't have an account? <Link to="/signup" className="text-[#C4623A] font-bold hover:underline">Sign up</Link>
      </p>
    </main>
  );
};
