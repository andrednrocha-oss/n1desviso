
import React, { useState, useEffect } from 'react';
import { EscalationLevel, CallValidation, Deviation } from '../types.ts';
import { saveDeviation, updateDeviation } from '../services/storage.ts';
import { 
  Send, 
  User, 
  Ticket, 
  MapPin, 
  Calendar, 
  Mail, 
  Copy,
  CheckCircle2,
  Loader2,
  FileText,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const ESCALATIONS: EscalationLevel[] = ['1ª Escalada', '2ª Escalada', '3ª Escalada', '4ª Escalada', '5ª Escalada'];

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

interface DeviationFormProps {
  onSuccess: () => void;
  initialData?: Deviation;
}

const DeviationForm: React.FC<DeviationFormProps> = ({ onSuccess, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    technicianName: initialData?.technicianName || '',
    escalationLevel: initialData?.escalationLevel || '1ª Escalada' as EscalationLevel,
    ticketNumber: initialData?.ticketNumber || '',
    location: initialData?.location || '',
    closingDate: initialData?.closingDate || new Date().toISOString().split('T')[0],
  });

  const [validation, setValidation] = useState<CallValidation>(initialData?.validation || {
    calledCustomer: false,
    evaluatedEquipment: false,
    customerDetails: { name: '', matricula: '' },
    dispenser: false,
    depositary: false,
    barcodeReader: false,
    printer: false,
    checkDepositary: false,
    sensoriamento: false,
    smartPower: false,
    observation: '',
    closureAuth: { name: '', department: '' },
  });

  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        technicianName: initialData.technicianName,
        escalationLevel: initialData.escalationLevel,
        ticketNumber: initialData.ticketNumber,
        location: initialData.location,
        closingDate: initialData.closingDate,
      });
      setValidation(initialData.validation);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const deviationData: Deviation = {
        id: initialData?.id || generateId(),
        ...formData,
        validation,
        createdAt: initialData?.createdAt || new Date().toISOString(),
      };
      
      if (initialData) {
        await updateDeviation(deviationData);
      } else {
        await saveDeviation(deviationData);
      }
      
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Erro ao processar operação. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (val: boolean) => val ? 'Validado' : 'Pendente';

  const emailBody = `Olá, prezados responsáveis,

Gostaria de formalizar o registro de um desvio operacional referente ao atendimento realizado pelo técnico ${formData.technicianName || '________'}.

Dados do Chamado:
- Técnico: ${formData.technicianName || '________'}
- Chamado: ${formData.ticketNumber || '________'}
- Local: ${formData.location || '________'}
- Escalada: ${formData.escalationLevel}
- Data de Fechamento: ${new Date(formData.closingDate).toLocaleDateString('pt-BR')}

Motivos do Desvio / Validações:
- Ligou para o Cliente: ${validation.calledCustomer ? `Sim (${validation.customerDetails?.name}, Matrícula: ${validation.customerDetails?.matricula})` : 'Não'}
- Avaliou Equipamento: ${validation.evaluatedEquipment ? 'Sim' : 'Não'}
- Dispensador: ${getStatusText(validation.dispenser)}
- Depositário: ${getStatusText(validation.depositary)}
- Leitor de Código de Barras: ${getStatusText(validation.barcodeReader)}
- Impressora: ${getStatusText(validation.printer)}
- Depositário de Cheques: ${getStatusText(validation.checkDepositary)}
- Sensoriamento: ${getStatusText(validation.sensoriamento)}
- SmartPower: ${getStatusText(validation.smartPower)}

Observações:
${validation.observation || 'Nenhuma observação adicional.'}

Fechamento Autorizado por: ${validation.closureAuth.name || '________'} (${validation.closureAuth.department || '________'})

Atenciosamente,
Equipe de Qualidade L1`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailBody);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          {initialData ? <RotateCcw className="text-blue-600" size={24} /> : <Send className="text-blue-600" size={24} />}
          {initialData ? 'Atualizar Registro' : 'Novo Registro de Desvio'}
        </h2>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <User size={14} /> Nome do Técnico
            </label>
            <input
              required
              disabled={loading}
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
              placeholder="Ex: João Silva"
              value={formData.technicianName}
              onChange={(e) => setFormData({...formData, technicianName: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Send size={14} /> Escalada
            </label>
            <select
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              value={formData.escalationLevel}
              onChange={(e) => setFormData({...formData, escalationLevel: e.target.value as EscalationLevel})}
            >
              {ESCALATIONS.map(lv => <option key={lv} value={lv}>{lv}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Ticket size={14} /> Número do Chamado
            </label>
            <input
              required
              disabled={loading}
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              placeholder="Ex: INC123456"
              value={formData.ticketNumber}
              onChange={(e) => setFormData({...formData, ticketNumber: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin size={14} /> Local
            </label>
            <input
              required
              disabled={loading}
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              placeholder="Ex: Agência Centro"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Calendar size={14} /> Data do Fechamento
          </label>
          <input
            required
            disabled={loading}
            type="date"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            value={formData.closingDate}
            onChange={(e) => setFormData({...formData, closingDate: e.target.value})}
          />
        </div>

        {/* Motivo do Desvio Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            Motivo do Desvio
          </h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold text-slate-700">Ligou para o cliente?</span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setValidation({...validation, calledCustomer: !validation.calledCustomer})}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${validation.calledCustomer ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-slate-200 text-slate-600'}`}
                >
                  {validation.calledCustomer ? 'SIM' : 'NÃO'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold text-slate-700">Avaliou equipamento?</span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setValidation({...validation, evaluatedEquipment: !validation.evaluatedEquipment})}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${validation.evaluatedEquipment ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-slate-200 text-slate-600'}`}
                >
                  {validation.evaluatedEquipment ? 'SIM' : 'NÃO'}
                </button>
              </div>
            </div>

            {validation.calledCustomer && (
              <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  type="text"
                  disabled={loading}
                  placeholder="Nome do Cliente"
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  value={validation.customerDetails?.name}
                  onChange={(e) => setValidation({
                    ...validation, 
                    customerDetails: { ...validation.customerDetails!, name: e.target.value }
                  })}
                />
                <input
                  type="text"
                  disabled={loading}
                  placeholder="Matrícula"
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  value={validation.customerDetails?.matricula}
                  onChange={(e) => setValidation({
                    ...validation, 
                    customerDetails: { ...validation.customerDetails!, matricula: e.target.value }
                  })}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
               {[
                 { id: 'dispenser', label: 'Dispensador' },
                 { id: 'depositary', label: 'Depositário' },
                 { id: 'barcodeReader', label: 'Leitor Código Barras' },
                 { id: 'printer', label: 'Impressora' },
                 { id: 'checkDepositary', label: 'Depositário Cheques' },
                 { id: 'sensoriamento', label: 'Sensoriamento' },
                 { id: 'smartPower', label: 'SmartPower' }
               ].map((item) => (
                 <label key={item.id} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                   <input
                    type="checkbox"
                    disabled={loading}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    checked={(validation as any)[item.id]}
                    onChange={(e) => setValidation({...validation, [item.id]: e.target.checked})}
                   />
                   <span className="text-[10px] font-bold text-slate-700 uppercase">{item.label}</span>
                 </label>
               ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <FileText size={12} /> Observação do Desvio
              </label>
              <textarea
                disabled={loading}
                rows={3}
                placeholder="Descreva detalhes adicionais sobre o desvio aqui..."
                className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={validation.observation}
                onChange={(e) => setValidation({...validation, observation: e.target.value})}
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <CheckCircle2 size={12} /> Fechamento Autorizado / Pedido
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled={loading}
                  placeholder="Nome do Solicitante"
                  className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={validation.closureAuth.name}
                  onChange={(e) => setValidation({...validation, closureAuth: {...validation.closureAuth, name: e.target.value}})}
                />
                <input
                  type="text"
                  disabled={loading}
                  placeholder="Departamento"
                  className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={validation.closureAuth.department}
                  onChange={(e) => setValidation({...validation, closureAuth: {...validation.closureAuth, department: e.target.value}})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {initialData && (
            <button
              type="button"
              onClick={onSuccess}
              className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-blue-400 shadow-lg shadow-blue-200"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (initialData ? <RotateCcw size={18} /> : <Send size={18} />)}
            {loading ? 'Processando...' : (initialData ? 'Atualizar Registro' : 'Salvar Registro')}
          </button>
        </div>
      </form>

      {/* Email Preview */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Mail className="text-amber-500" size={24} />
              E-mail Padrão
            </h2>
            <div className="relative">
              <button
                type="button"
                onClick={copyToClipboard}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                title="Copiar Texto"
              >
                {showCopyTooltip ? <CheckCircle2 className="text-green-500" /> : <Copy size={20} />}
              </button>
              {showCopyTooltip && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded">
                  Copiado!
                </span>
              )}
            </div>
          </div>

          <div className="flex-grow p-6 bg-slate-50 rounded-xl border border-slate-100 font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[600px]">
            {emailBody}
          </div>
          
          <p className="mt-4 text-xs text-slate-400 italic">
            * O texto acima é atualizado em tempo real conforme você preenche o formulário.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeviationForm;
