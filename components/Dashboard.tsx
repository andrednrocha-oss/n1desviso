
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
import { getDeviations, deleteDeviation } from '../services/storage.ts';
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
  Eye, 
  Pencil, 
  Search, 
  ChevronRight, 
  X,
  Trash2,
  Mail,
  Copy,
  CheckCircle2,
  Ticket,
  FileText
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#0ea5e9', '#f43f5e'];

interface DashboardProps {
  onEdit: (deviation: Deviation) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onEdit }) => {
  const [data, setData] = useState<Deviation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeviation, setSelectedDeviation] = useState<Deviation | null>(null);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

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
    return data.filter(d => 
      d.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

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

    data.forEach(d => {
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
      total: data.length,
      technicianRanking,
      hardwareData
    };
  }, [data]);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      await deleteDeviation(id);
      fetchData();
    }
  };

  const getEmailText = (d: Deviation) => {
    const hardwareFailures = [
      { id: 'dispenser', label: 'Dispensador' },
      { id: 'depositary', label: 'Depositário' },
      { id: 'barcodeReader', label: 'Leitor de Código de Barras' },
      { id: 'printer', label: 'Impressora' },
      { id: 'checkDepositary', label: 'Depositário de Cheques' },
      { id: 'sensoriamento', label: 'Sensoriamento' },
      { id: 'smartPower', label: 'SmartPower' },
      { id: 'nat', label: 'NAT (Não Atendimento)' },
      { id: 'sw', label: 'SW (Software/Sistema)' }
    ].filter(item => (d.validation as any)[item.id])
     .map(item => `- Falha Identificada: ${item.label}`)
     .join('\n');

    return `Olá, prezados responsáveis,

Gostaria de formalizar o registro de um desvio operacional referente ao atendimento realizado pelo técnico ${d.technicianName}.

Dados do Chamado:
- Técnico: ${d.technicianName}
- Chamado: ${d.ticketNumber}
- Local: ${d.location}
- Escalada: ${d.escalationLevel}
- Data de Fechamento: ${new Date(d.closingDate).toLocaleDateString('pt-BR')}

Validações de Contato:
- Ligou para o Cliente: ${d.validation.calledCustomer ? `Sim (${d.validation.customerDetails?.name}, Matrícula: ${d.validation.customerDetails?.matricula})` : 'Não'}
- Avaliou Equipamento: ${d.validation.evaluatedEquipment ? 'Sim' : 'Não'}

Motivos do Desvio (Falhas Identificadas):
${hardwareFailures || 'Nenhum motivo específico selecionado.'}

Observações Adicionais:
${d.validation.observation || 'Nenhuma observação adicional.'}

Fechamento Autorizado por: ${d.validation.closureAuth.name} (${d.validation.closureAuth.department})

Atenciosamente,
Equipe de Qualidade L1`;
  };

  const copyEmail = (d: Deviation) => {
    navigator.clipboard.writeText(getEmailText(d));
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

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
          <div><p className="text-[10px] text-slate-500 font-bold uppercase">Locais</p><h3 className="text-xl font-bold">{new Set(data.map(d => d.location)).size}</h3></div>
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Ranking de Técnicos (Top 5)</h3>
          </div>
          <div className="space-y-4">
            {stats.technicianRanking.slice(0, 5).map((tech, idx) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Registros */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
            Registros Detalhados
            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
              {filteredData.length} registros
            </span>
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Data</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Técnico</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Chamado</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Local</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(d.closingDate).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-bold">{d.technicianName}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100">{d.ticketNumber}</span></td>
                  <td className="px-6 py-4 text-sm text-slate-500">{d.location}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedDeviation(d)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
                      <button onClick={() => onEdit(d)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Pencil size={18} /></button>
                      <button onClick={() => handleDelete(d.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedDeviation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200"><Ticket size={24} /></div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Detalhes do Desvio</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{selectedDeviation.ticketNumber}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDeviation(null)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400"><X size={20} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Técnico Responsável</p>
                  <p className="font-bold text-slate-900">{selectedDeviation.technicianName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nível de Escalada</p>
                  <p className="font-bold text-slate-900">{selectedDeviation.escalationLevel}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Falhas Identificadas</p>
                <div className="flex flex-wrap gap-2">
                   {[
                    { id: 'dispenser', label: 'Dispensador' },
                    { id: 'depositary', label: 'Depositário' },
                    { id: 'barcodeReader', label: 'Leitor' },
                    { id: 'printer', label: 'Impressora' },
                    { id: 'checkDepositary', label: 'Dep. Cheques' },
                    { id: 'sensoriamento', label: 'Sensores' },
                    { id: 'smartPower', label: 'SmartPower' },
                    { id: 'nat', label: 'NAT' },
                    { id: 'sw', label: 'SW' }
                  ].map(comp => {
                    if (!(selectedDeviation.validation as any)[comp.id]) return null;
                    return (
                      <span key={comp.id} className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase border bg-red-50 text-red-700 border-red-200">
                        Falha: {comp.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FileText size={12} /> Observações</p>
                <p className="text-sm text-slate-700 italic">{selectedDeviation.validation.observation || 'Sem observações.'}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Mail size={12} /> Visualização do E-mail</p>
                  <button onClick={() => copyEmail(selectedDeviation)} className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase">
                    {showCopyTooltip ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                    {showCopyTooltip ? 'Copiado!' : 'Copiar E-mail'}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-slate-300 text-[10px] font-mono rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {getEmailText(selectedDeviation)}
                </pre>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => { onEdit(selectedDeviation); setSelectedDeviation(null); }} className="flex-1 bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-200 flex items-center justify-center gap-2">
                <Pencil size={18} /> Editar Agora
              </button>
              <button onClick={() => setSelectedDeviation(null)} className="flex-1 bg-white text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-100 border border-slate-200">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
