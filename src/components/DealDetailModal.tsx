import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Flame, 
  Share2, 
  Copy, 
  Check, 
  Truck, 
  ShieldCheck, 
  Send,
  MessageSquare,
  ThumbsUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Deal, Comment } from '../types';
import { formatBRL, timeAgo } from '../lib/affiliate';
import { fetchComments, addComment } from '../services/dealService';

interface DealDetailModalProps {
  deal: Deal | null;
  onClose: () => void;
  onVote: (dealId: string, type: 'up' | 'down') => void;
  onShareWhatsApp: (deal: Deal) => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  deal,
  onClose,
  onVote,
  onShareWhatsApp,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (deal) {
      fetchComments(deal.id).then(setComments);
    }
  }, [deal]);

  if (!deal) return null;

  const handleCopyCoupon = () => {
    if (!deal.couponCode) return;
    navigator.clipboard.writeText(deal.couponCode);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await addComment(deal.id, newComment.trim());
      setComments([created, ...comments]);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const savings = deal.originalPrice > deal.promoPrice ? deal.originalPrice - deal.promoPrice : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-900 rounded-md border border-purple-200">
              {deal.store}
            </span>
            <span className="text-xs text-slate-500">
              Publicado {timeAgo(deal.postedAt)}
            </span>
            {deal.isHot && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                🔥 Destaque Quente
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Product Image */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full h-64 bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-center shadow-2xs">
                <img
                  src={deal.imageUrl}
                  alt={deal.title}
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Temperature Badge */}
              <div className="mt-3 w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  {deal.temperature}° de Temperatura
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onVote(deal.id, 'up')}
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-bold"
                  >
                    + Votar Quente
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Deal Details & Purchase Box */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {deal.title}
                </h2>

                {deal.description && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {deal.description}
                  </p>
                )}

                {/* Price block */}
                <div className="mt-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                  {deal.originalPrice > deal.promoPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs line-through text-slate-500">
                        De: {formatBRL(deal.originalPrice)}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Economize {formatBRL(savings)} ({deal.discountPercentage}% OFF)
                      </span>
                    </div>
                  )}

                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-1">
                    {formatBRL(deal.promoPrice)}
                  </div>

                  <p className="text-xs font-medium text-purple-900 mt-1">
                    {deal.paymentConditions}
                  </p>

                  {deal.freeShipping && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <Truck className="w-3.5 h-3.5" />
                      Frete Grátis disponível para várias regiões
                    </div>
                  )}
                </div>

                {/* Coupon Pill if available */}
                {deal.couponCode && (
                  <div className="mt-3 p-3 bg-amber-50 border border-dashed border-amber-300 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-amber-900 block">
                        CUPOM DE DESCONTO:
                      </span>
                      <span className="font-mono font-extrabold text-sm text-amber-950">
                        {deal.couponCode}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyCoupon}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      {copiedCoupon ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCoupon ? 'Copiado!' : 'Copiar Cupom'}
                    </button>
                  </div>
                )}
              </div>

              {/* Call to Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={deal.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-center"
                >
                  <span>Pegar Promoção na {deal.store}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => onShareWhatsApp(deal)}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar no WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Comments & Community Discussion (Estilo Promobit) */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              Discussão da Comunidade ({comments.length})
            </h3>

            {/* Comment input form */}
            <form onSubmit={handleSendComment} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Já comprou? O frete valeu a pena? Deixe sua dica..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Comentar
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comm) => (
                <div key={comm.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-purple-900">
                      {comm.author}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {timeAgo(comm.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {comm.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
