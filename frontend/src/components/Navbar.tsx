import React from 'react';
import { Shield, Activity, History, PlusCircle, LogIn, LogOut, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout, demoLogin } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-dark-700/60 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Tag */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-accent p-0.5 shadow-glow-brand">
              <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-accent animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Ops<span className="text-brand-500">Copilot</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-nvidia/10 text-brand-nvidia border border-brand-nvidia/20">
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  Nemotron AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald inline-block mr-1.5 animate-ping"></span>
                Nebius Token Factory Engine
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'dashboard'
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-dark-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>SRE Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('new-incident')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'new-incident'
                  ? 'bg-brand-600 text-white shadow-glow-brand'
                  : 'bg-brand-600/20 text-brand-300 hover:bg-brand-600/30 border border-brand-500/30'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Incident</span>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'history'
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-dark-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Incident History</span>
            </button>

            <button
              onClick={() => onNavigate('privacy')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentView === 'privacy'
                  ? 'text-brand-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy Notice</span>
            </button>
          </nav>

          {/* User / Auth Controls */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-dark-850 border border-dark-700">
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-white truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] text-brand-400 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-dark-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => demoLogin()}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-600 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-nvidia" />
                  <span>Demo SRE Login</span>
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
