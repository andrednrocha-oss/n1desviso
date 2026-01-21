
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { getDeviations } from '../services/storage.ts';
import { supabase } from '../services/supabase.ts';
import { Deviation } from '../types.ts';
import { 
  AlertCircle, 
  Users, 
  MapPin, 
  BarChart3, 
  Loader2, 
  DatabaseZap, 
  Cpu,
  Calendar
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#0ea5e9', '#f43f5e'];

const MONTHS = [
  { value: 'all', label: 'Todos os Meses' },
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' }
];

interface DashboardProps {
  onEdit: (deviation: Deviation) => void;
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [data, setData] = useState<Deviation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const deviations = await getDeviations();
      setData(deviations);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (selectedMonth === 'all') return data;
    return data.filter(d => {
      const month = d.closingDate.split('-')[1];
      return month === selectedMonth;
    });
  }, [data, selectedMonth]);

  const stats = useMemo(() => {
    const technicianCounts: Record<string, number> = {};
    const hardwareStats: Record<string, number> = {
      'Dispensador': 0,
      'Depositário': 0,
      'Leitor': 0,
      'Impressora': 0,
      'Dep. Cheques': 0,
      'Sensoriamento': 0,
      'SmartPower': 0,
      'NAT': 0,
      'SW': 0
    };

    filteredData.forEach(d => {
      const techName = d.technicianName;
      if (techName) {
        technicianCounts[techName] = (technicianCounts[techName] || 0) + 1;
      }
      
      const v = d.validation;
      if (v.dispenser) hardwareStats['Dispensador']++;
      if (v.depositary) hardwareStats['Depositário']++;
      if (v.barcodeReader) hardwareStats['Leitor']++;
      if (v.printer) hardwareStats['Impressora']++;
      if (v.checkDepositary) hardwareStats['Dep. Cheques']++;
      if (v.sensoriamento) hardwareStats['Sensoriamento']++;
      if (v.smartPower) hardwareStats['SmartPower']++;
      if (v.nat) hardwareStats['NAT']++;
      if (v.sw) hardwareStats['SW']++;
    });

    const technicianRanking = Object.entries(technicianCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const hardwareData = Object.entries(hardwareStats)
      .map(([name, count]) => ({ name, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);

    return {
      total: filteredData.length,
      technicianRanking,
      hardwareData
    };
  }, [filteredData]);

  if (loading && data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-4">
        <Loader2 size={40} className="animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Carregando dados estatísticos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header with Month Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Métricas de Performance</h3>
          <p className="text-sm text-slate-500">Visualize a evolução dos desvios mensalmente.</p>
        </div>
        <div className="relative min-w-[200px]">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none cursor-pointer"
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {!supabase && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800 text-sm shadow-sm">
          <DatabaseZap size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-0.5">Modo Local Ativo</p>
            <p className="text-amber-700/80">Conecte o Supabase para sincronizar estes dados.</p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><AlertCircle size={22} /></div>
          <div><p className="text-[10px] text-slate-500 font-bold uppercase">Total Ocorrências</p><h3 className="text-xl font-bold">{stats.total}</h3></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Users size={22} /></div>
          <div><p className="text-[10px] text-slate-500 font-bold uppercase">Técnicos</p><h3 className="text-xl font-bold">{stats.technicianRanking.length}</h3></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><MapPin size={22} /></div>
          <div><p className="text-[10px] text-slate-500 font-bold uppercase">Locais</p><h3 className="text-xl font-bold">{new Set(filteredData.map(d => d.location)).size}</h3></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Cpu size={22} /></div>
          <div><p className="text-[10px] text-slate-500 font-bold uppercase">Componentes</p><h3 className="text-xl font-bold">{stats.hardwareData.reduce((acc, curr) => acc + curr.count, 0)}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <Cpu size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Desvios por Componente (Motivos)</h3>
          </div>
          {stats.hardwareData.length > 0 ? (
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
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-400 italic text-sm">
              Sem dados para este período.
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Ranking de Técnicos (Top 5)</h3>
          </div>
          <div className="space-y-4">
            {stats.technicianRanking.length > 0 ? (
              stats.technicianRanking.slice(0, 5).map((tech, idx) => (
                <div key={tech.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-[10px] font-bold text-slate-500">{idx + 1}</span>
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{tech.name}</span>
                      <span className="text-sm font-bold text-slate-900">{tech.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${(tech.count / Math.max(stats.total, 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-[280px] flex items-center justify-center text-slate-400 italic text-sm">
                Sem técnicos registrados neste período.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
