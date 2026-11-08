import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { Deal } from '../types';
import { formatBRL } from '../lib/affiliate';

interface VipGroupsModalProps {
  deals: Deal[];
  initialDeal?: Deal | null;
  onClose: () => void;
}

export const VipGroupsModal: React.FC<VipGroupsModalProps> = ({
  deals,
  initialDeal,
  onClose,
}) => {
  const [selectedDealId, setSelectedDealId] = useState<string>(
    initialDeal ? initialDeal.id : (deals[0]?.id || '')
  );
  const [copiedText, setCopiedText] = useState(false);

  const currentDeal = deals.find((d) => d.id === selectedDealId) || deals[0];

  const generateWhatsAppMessage = (deal?: Deal) => {
    if (!deal) return '';
    const discount = deal.discountPercentage > 0 ? ` (${deal.discountPercentage}% OFF)` : '';
    const coupon = deal.couponCode ? `\n🎟 Use o Cupom: *${deal.couponCode}*` : '';

    return `🔥 *ACHADINHO IMPERDÍVEL DA TERRA!* 🔥\n\n` +
      `📦 *${deal.title}*\n\n` +
      `❌ De: ~${formatBRL(deal.originalPrice)}~\n` +
      `✅ *Por apenas: ${formatBRL(deal.promoPrice)}*${discount}\n` +
      `💳 Condição: ${deal.paymentConditions}${coupon}\n` +
      `🏬 Loja: ${deal.store}\n\n` +
      `🛒 *Pegue aqui antes que acabe:* 👇\n` +
      `${deal.affiliateUrl}\n\n` +
      `⚡ _Preço sujeito a alteração a qualquer momento._`;
  };

  const formattedMsg = generateWhatsAppMessage(currentDeal);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMsg);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleOpenWhatsAppShare = () => {
    const encoded = encodeURIComponent(formattedMsg);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Grupos VIP & Disparador WhatsApp
              </h2>
              <p className="text-xs text-slate-500">
                Entre nos grupos exclusivos ou compartilhe achadinhos com sua audiência
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Join VIP channels buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://chat.whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-3"
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block">Grupo VIP WhatsApp</span>
                <span className="text-[11px] text-emerald-100">Bugs e ofertas imediatas</span>
              </div>
            </a>

            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-3"
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <Send className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block">Canal no Telegram</span>
                <span className="text-[11px] text-blue-100">Feed silencioso 24/7</span>
              </div>
            </a>
          </div>

          {/* Formatter Tool for Affiliates */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Gerador de Mensagem com Link Afiliado
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Pronto para copiar
              </span>
            </div>

            {/* Select Deal */}
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">
                Escolha a oferta para formatar:
              </label>
              <select
                value={selectedDealId}
                onChange={(e) => setSelectedDealId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
              >
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    [{d.store}] {d.title.substring(0, 50)}... ({formatBRL(d.promoPrice)})
                  </option>
                ))}
              </select>
            </div>

            {/* Formatted Text Preview */}
            <div className="relative">
              <textarea
                readOnly
                rows={7}
                value={formattedMsg}
                className="w-full p-3 font-mono text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none select-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copiado para a área de transferência!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Mensagem Formatada
                  </>
                )}
              </button>

              <button
                onClick={handleOpenWhatsAppShare}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
