
import React, { useMemo, useState, useEffect } from 'react';
import { getDeviations, deleteDeviation } from '../services/storage.ts';
import { Deviation } from '../types.ts';
import { 
  Eye, 
  Pencil, 
  Search, 
  X,
  Trash2,
  Mail,
  Copy,
  CheckCircle2,
  Ticket,
  FileText,
  Loader2
} from 'lucide-react';

const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return '________';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

interface HistoryProps {
  onEdit: (deviation: Deviation) => void;
}

const History: React.FC<HistoryProps> = ({ onEdit }) => {
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
- Data de Fechamento: ${formatDateDisplay(d.closingDate)}

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
        <p className="font-medium animate-pulse">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
            Registros Históricos
            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
              {filteredData.length} registros
            </span>
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Buscar por técnico, chamado ou local..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                    {formatDateDisplay(d.closingDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-bold whitespace-nowrap">
                    {d.technicianName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100 whitespace-nowrap">
                      {d.ticketNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">
                    {d.location}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedDeviation(d)} 
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => onEdit(d)} 
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id)} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">
                    Nenhum registro encontrado para a pesquisa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDeviation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                  <Ticket size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Detalhes do Registro</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{selectedDeviation.ticketNumber}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDeviation(null)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Técnico</p>
                  <p className="font-bold text-slate-900">{selectedDeviation.technicianName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escalada</p>
                  <p className="font-bold text-slate-900">{selectedDeviation.escalationLevel}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data Fechamento</p>
                  <p className="font-bold text-slate-900">{formatDateDisplay(selectedDeviation.closingDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local</p>
                  <p className="font-bold text-slate-900">{selectedDeviation.location}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ocorrências Marcadas</p>
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
                        {comp.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText size={12} /> Observações
                </p>
                <p className="text-sm text-slate-700 italic">{selectedDeviation.validation.observation || 'Sem observações registradas.'}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail size={12} /> E-mail Gerado
                  </p>
                  <button onClick={() => copyEmail(selectedDeviation)} className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase hover:underline">
                    {showCopyTooltip ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                    {showCopyTooltip ? 'Copiado!' : 'Copiar Texto'}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-slate-300 text-[10px] font-mono rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {getEmailText(selectedDeviation)}
                </pre>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => { onEdit(selectedDeviation); setSelectedDeviation(null); }} 
                className="flex-1 bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
              >
                <Pencil size={18} /> Editar Registro
              </button>
              <button 
                onClick={() => setSelectedDeviation(null)} 
                className="flex-1 bg-white text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-100 border border-slate-200 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
