import React, { useState } from 'react';
import { Shield, Sparkles, Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onNavigate: (view: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('sre_engineer');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, demoLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await demoLogin();
      onNavigate('dashboard');
    } catch (err: any) {
      setError('Demo login failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-16 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-accent p-0.5 shadow-glow-brand mb-2">
          <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
            <Shield className="w-7 h-7 text-brand-accent" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Welcome to OpsCopilot
        </h1>
        <p className="text-xs text-slate-400">
          Autonomous SRE AI Agent powered by NVIDIA Nemotron & Nebius Token Factory
        </p>
      </div>

      {/* 1-Click Quick Demo Login Button for Judges / Users */}
      <button
        onClick={handleDemoLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center space-x-2.5 p-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-glow-emerald transition-all transform active:scale-95 disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4 text-emerald-200" />
        <span>🚀 1-Click Demo SRE Login (No Setup Needed)</span>
      </button>

      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-dark-700"></div>
        <span className="px-3 text-xs text-slate-500 font-mono">OR SIGN IN WITH EMAIL</span>
        <div className="flex-1 border-t border-dark-700"></div>
      </div>

      {/* Auth Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-700 space-y-5">
        {/* Toggle Mode */}
        <div className="flex p-1 bg-dark-900 rounded-xl border border-dark-750">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              !isRegister ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isRegister ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  required={isRegister}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-850 border border-dark-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sre@company.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-dark-850 border border-dark-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-dark-850 border border-dark-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-850 border border-dark-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="sre_engineer">SRE Engineer</option>
                <option value="devops_lead">DevOps Lead</option>
                <option value="infrastructure_architect">Infrastructure Architect</option>
                <option value="incident_commander">Incident Commander</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow-brand transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
