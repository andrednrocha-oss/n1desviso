
import React, { useState } from 'react';
import { LayoutDashboard, FilePlus2, ChevronRight, Activity, Cloud, CloudOff } from 'lucide-react';
import DeviationForm from './components/DeviationForm.tsx';
import Dashboard from './components/Dashboard.tsx';
import { supabase } from './services/supabase.ts';

type View = 'form' | 'dashboard';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const isOnline = !!supabase;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Activity className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 leading-none">DeviTrack</h1>
                  <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">L1 Intelligence</p>
                </div>
              </div>
              
              {/* Connection Status Badge */}
              <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isOnline 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {isOnline ? (
                  <>
                    <Cloud size={12} />
                    <span>Sistema Online</span>
                  </>
                ) : (
                  <>
                    <CloudOff size={12} />
                    <span>Modo Offline</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-4">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeView === 'dashboard' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <button
                onClick={() => setActiveView('form')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeView === 'form' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FilePlus2 size={18} />
                <span className="hidden sm:inline">Novo Registro</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span>DeviTrack</span>
            <ChevronRight size={14} />
            <span className="font-medium text-slate-700">
              {activeView === 'dashboard' ? 'Dashboard Estatístico' : 'Registrar Novo Desvio'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {activeView === 'dashboard' ? 'Visão Geral de Desvios' : 'Abertura de Ocorrência'}
          </h2>
        </div>

        {activeView === 'form' ? (
          <DeviationForm onSuccess={() => setActiveView('dashboard')} />
        ) : (
          <Dashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} DeviTrack L1 - Sistema Interno de Gestão de Qualidade TI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
