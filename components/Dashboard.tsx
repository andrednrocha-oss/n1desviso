
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
import { getDeviations } from '../services/storage';
import { supabase } from '../services/supabase';
import { Deviation } from '../types';
import { AlertCircle, Users, MapPin, BarChart3, Loader2, DatabaseZap } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<Deviation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deviations = await getDeviations();
        setData(deviations);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const analystCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};

    data.forEach(d => {
      analystCounts[d.analystName] = (analystCounts[d.analystName] || 0) + 1;
      locationCounts[d.location] = (locationCounts[d.location] || 0) + 1;
    });

    const analystRanking = Object.entries(analystCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const locationData = Object.entries(locationCounts)
      .map(([location, count]) => ({ name: location, value: count }));

    return {
      total: data.length,
      analystRanking,
      locationData
    };
  }, [data]);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-4">
        <Loader2 size={40} className="animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Offline Warning Banner */}
      {!supabase && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800 text-sm shadow-sm animate-in slide-in-from-top-4 duration-500">
          <DatabaseZap size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-0.5">Modo de Armazenamento Local</p>
            <p className="text-amber-700/80">
              O Supabase não foi configurado (chaves SUPABASE_URL e SUPABASE_ANON_KEY ausentes). 
              Seus registros estão sendo salvos localmente neste navegador.
            </p>
          </div>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total de Desvios</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Analistas Registrados</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.analystRanking.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Locais Afetados</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.locationData.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analyst Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 size={20} className="text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-lg">Desvios por Analista</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.analystRanking.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {stats.analystRanking.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-2 mb-6">
            <MapPin size={20} className="text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-lg">Distribuição por Local</h3>
          </div>
          <div className="h-[300px] w-full flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.locationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.locationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
               {stats.locationData.slice(0, 5).map((entry, index) => (
                 <div key={entry.name} className="flex items-center space-x-1">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                   <span className="text-xs text-slate-600 font-medium">{entry.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-lg">Top 5 Analistas com mais Desvios</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Analista</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Impacto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.analystRanking.slice(0, 5).map((analyst, idx) => (
              <tr key={analyst.name} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{analyst.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{analyst.count}</td>
                <td className="px-6 py-4">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[100px]">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${(analyst.count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
            {stats.analystRanking.length === 0 && (
               <tr>
                 <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">Nenhum registro encontrado.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
