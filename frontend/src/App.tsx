import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { NewIncident } from './pages/NewIncident';
import { IncidentDetail } from './pages/IncidentDetail';
import { History } from './pages/History';
import { Login } from './pages/Login';
import { PrivacyNotice } from './pages/PrivacyNotice';
import { Shield, Lock } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | undefined>(undefined);

  // Sync with browser hash routing for deep links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash.startsWith('incidents/')) {
        const id = hash.replace('incidents/', '');
        setSelectedIncidentId(id);
        setCurrentView('incident-detail');
      } else if (hash === 'new') {
        setCurrentView('new-incident');
      } else if (hash === 'history') {
        setCurrentView('history');
      } else if (hash === 'login') {
        setCurrentView('login');
      } else if (hash === 'privacy') {
        setCurrentView('privacy');
      } else {
        setCurrentView('dashboard');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: string, incidentId?: string) => {
    setCurrentView(view);
    if (incidentId) {
      setSelectedIncidentId(incidentId);
      window.location.hash = `#/incidents/${incidentId}`;
    } else if (view === 'new-incident') {
      window.location.hash = '#/new';
    } else if (view === 'history') {
      window.location.hash = '#/history';
    } else if (view === 'login') {
      window.location.hash = '#/login';
    } else if (view === 'privacy') {
      window.location.hash = '#/privacy';
    } else {
      window.location.hash = '#/';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white bg-mesh">
      {/* Top Navigation */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentView === 'dashboard' && (
          <Dashboard onNavigate={handleNavigate} />
        )}
        {currentView === 'new-incident' && (
          <NewIncident onNavigate={handleNavigate} />
        )}
        {currentView === 'incident-detail' && selectedIncidentId && (
          <IncidentDetail incidentId={selectedIncidentId} onNavigate={handleNavigate} />
        )}
        {currentView === 'history' && (
          <History onNavigate={handleNavigate} />
        )}
        {currentView === 'login' && (
          <Login onNavigate={handleNavigate} />
        )}
        {currentView === 'privacy' && (
          <PrivacyNotice onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-750/60 bg-dark-950/90 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 font-bold text-slate-200">
              <Shield className="w-4 h-4 text-brand-500" />
              <span>OpsCopilot</span>
            </div>
            <span>•</span>
            <span className="flex items-center space-x-1 text-slate-400">
              <span>Powered by</span>
              <strong className="text-brand-nvidia">NVIDIA Nemotron</strong>
              <span>on</span>
              <strong className="text-white">Nebius Token Factory</strong>
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => handleNavigate('privacy')}
              className="hover:text-brand-400 transition-colors flex items-center space-x-1"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy Notice</span>
            </button>
            <button
              onClick={() => handleNavigate('dashboard')}
              className="hover:text-brand-400 transition-colors"
            >
              SRE Dashboard
            </button>
            <button
              onClick={() => handleNavigate('history')}
              className="hover:text-brand-400 transition-colors"
            >
              Incident History
            </button>
            <span className="text-slate-600">MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
