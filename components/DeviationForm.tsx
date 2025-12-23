
import React, { useState } from 'react';
import { EscalationLevel, CallValidation, Deviation } from '../types';
import { saveDeviation } from '../services/storage';
import { 
  Send, 
  User, 
  Ticket, 
  MapPin, 
  Calendar, 
  CheckSquare, 
  Mail, 
  Copy,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const ESCALATIONS: EscalationLevel[] = ['1ª Escalada', '2ª Escalada', '3ª Escalada', '4ª Escalada', '5ª Escalada'];

const DeviationForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    analystName: '',
    escalationLevel: '1ª Escalada' as EscalationLevel,
    ticketNumber: '',
    location: '',
    closingDate: new Date().toISOString().split('T')[0],
  });

  const [validation, setValidation] = useState<CallValidation>({
    calledCustomer: false,
    customerDetails: { name: '', matricula: '' },
    saques: false,
    depositos: false,
    sensoriamento: false,
    smartPower: false,
    closureAuth: { name: '', department: '' },
  });

  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const newDeviation: Deviation = {
        id: crypto.randomUUID(),
        ...formData,
        validation,
        createdAt: new Date().toISOString(),
      };
      
      await saveDeviation(newDeviation);
      onSuccess();
      
      // Reset form
      setFormData({
        analystName: '',
        escalationLevel: '1ª Escalada',
        ticketNumber: '',
        location: '',
        closingDate: new Date().toISOString().split('T')[0],
      });
      setValidation({
        calledCustomer: false,
        customerDetails: { name: '', matricula: '' },
        saques: false,
        depositos: false,
        sensoriamento: false,
        smartPower: false,
        closureAuth: { name: '', department: '' },
      });
    } catch (error) {
      alert('Erro ao salvar no banco de dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const emailBody = `Olá, prezados responsáveis,

Gostaria de formalizar o registro de um desvio operacional referente ao atendimento realizado pelo analista ${formData.analystName || '________'}.

Dados do Chamado:
- Analista: ${formData.analystName || '________'}
- Chamado: ${formData.ticketNumber || '________'}
- Local: ${formData.location || '________'}
- Escalada: ${formData.escalationLevel}
- Data de Fechamento: ${new Date(formData.closingDate).toLocaleDateString('pt-BR')}

Validações Realizadas:
- Ligou para o Cliente: ${validation.calledCustomer ? `Sim (${validation.customerDetails?.name}, Matrícula: ${validation.customerDetails?.matricula})` : 'Não'}
- Saques: ${validation.saques ? 'Validado' : 'Pendente'}
- Depósitos: ${validation.depositos ? 'Validado' : 'Pendente'}
- Sensoriamento: ${validation.sensoriamento ? 'Validado' : 'Pendente'}
- SmartPower: ${validation.smartPower ? 'Validado' : 'Pendente'}
- Fechamento Autorizado por: ${validation.closureAuth.name || '________'} (${validation.closureAuth.department || '________'})

Atenciosamente,
Equipe de Qualidade L1`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailBody);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Send className="text-blue-600" size={24} />
          Novo Registro de Desvio
        </h2>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <User size={14} /> Nome do Analista
            </label>
            <input
              required
              disabled={loading}
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
              placeholder="Ex: João Silva"
              value={formData.analystName}
              onChange={(e) => setFormData({...formData, analystName: e.target.value})}
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

        {/* Validation Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare size={20} className="text-green-600" />
            Área de Validações
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-700">Ligou para o cliente?</span>
              <button
                type="button"
                disabled={loading}
                onClick={() => setValidation({...validation, calledCustomer: !validation.calledCustomer})}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${validation.calledCustomer ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'}`}
              >
                {validation.calledCustomer ? 'SIM' : 'NÃO'}
              </button>
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

            <div className="grid grid-cols-2 gap-3">
               {['saques', 'depositos', 'sensoriamento', 'smartPower'].map((field) => (
                 <label key={field} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                   <input
                    type="checkbox"
                    disabled={loading}
                    className="w-4 h-4 text-blue-600 rounded"
                    checked={(validation as any)[field]}
                    onChange={(e) => setValidation({...validation, [field]: e.target.checked})}
                   />
                   <span className="text-xs font-medium text-slate-700 capitalize">{field}</span>
                 </label>
               ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Fechamento Autorizado / Pedido</label>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-blue-400"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {loading ? 'Salvando...' : 'Salvar Registro'}
        </button>
      </form>

      {/* Email Preview */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
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

          <div className="flex-grow p-6 bg-slate-50 rounded-xl border border-slate-100 font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[500px]">
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
