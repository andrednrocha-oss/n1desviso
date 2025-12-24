
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { getDeviations } from '../services/storage.ts';
import { supabase } from '../services/supabase.ts';
import { Deviation } from '../types.ts';
import { AlertCircle, Users, MapPin, BarChart3, Loader2, DatabaseZap, Cpu } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<Deviation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deviations = await getDeviations();
        setData(deviations);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const analystCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};
    const hardwareStats: Record<string, number> = {
      'Dispensador': 0,
      'Depositário': 0,
      'Leitor': 0,
      'Impressora': 0,
      'Dep. Cheques': 0,
      'Sensoriamento': 0,
      'SmartPower': 0
    };

    data.forEach(d => {
      analystCounts[d.analystName] = (analystCounts[d.analystName] || 0) + 1;
      locationCounts[d.location] = (locationCounts[d.location] || 0) + 1;
      
      // Contabiliza desvios (quando o campo está como false/pendente)
      if (!d.validation.dispenser) hardwareStats['Dispensador']++;
      if (!d.validation.depositary) hardwareStats['Depositário']++;
      if (!d.validation.barcodeReader) hardwareStats['Leitor']++;
      if (!d.validation.printer) hardwareStats['Impressora']++;
      if (!d.validation.checkDepositary) hardwareStats['Dep. Cheques']++;
      if (!d.validation.sensoriamento) hardwareStats['Sensoriamento']++;
      if (!d.validation.smartPower) hardwareStats['SmartPower']++;
    });

    const analystRanking = Object.entries(analystCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const locationData = Object.entries(locationCounts)
      .map(([location, count]) => ({ name: location, value: count }));

    const hardwareData = Object.entries(hardwareStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: data.length,
      analystRanking,
      locationData,
      hardwareData
    };
  }, [data]);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-4">
        <Loader2 size={40} className="animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Carregando dados estatísticos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {!supabase && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800 text-sm shadow-sm">
          <DatabaseZap size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-0.5">Modo Local Ativo</p>
            <p className="text-amber-700/80">
              Conecte o Supabase para sincronizar estes dados com a equipe.
            </p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><AlertCircle size={22} /></div>
          <div><p className="text-[10px] text-slate-500 font-bold uppercase">Total</p><h3 className="text-xl font-bold">{stats.total}</h3></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Users size={22} /></div>
          <div><p className="text-[10px] text-slate-500 font-bold uppercase">Analistas</p><h3 className="text-xl font-bold">{stats.analystRanking.length}</h3></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><MapPin size={22} /></div>
          <div><p className="text-[10px] text-slate-500 font-bold uppercase">Locais</p><h3 className="text-xl font-bold">{stats.locationData.length}</h3></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Cpu size={22} /></div>
          <div><p className="text-[10px] text-slate-500 font-bold uppercase">Alertas Hardware</p><h3 className="text-xl font-bold">{stats.hardwareData.reduce((acc, curr) => acc + curr.count, 0)}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardware Deviations Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <Cpu size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Desvios por Componente</h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.hardwareData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {stats.hardwareData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analyst Ranking */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Ranking de Analistas (Top 5)</h3>
          </div>
          <div className="space-y-4">
            {stats.analystRanking.slice(0, 5).map((analyst, idx) => (
              <div key={analyst.name} className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-[10px] font-bold text-slate-500">{idx + 1}</span>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{analyst.name}</span>
                    <span className="text-sm font-bold text-slate-900">{analyst.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(analyst.count / Math.max(stats.total, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {stats.analystRanking.length === 0 && <p className="text-center text-slate-400 py-10 italic">Nenhum desvio registrado.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
