import React, { useState } from 'react';
import { 
  Flame, 
  ExternalLink, 
  MessageSquare, 
  Share2, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown,
  Truck,
  Sparkles
} from 'lucide-react';
import { Deal } from '../types';
import { formatBRL, timeAgo } from '../lib/affiliate';

interface DealCardProps {
  deal: Deal;
  onSelectDeal: (deal: Deal) => void;
  onVote: (dealId: string, type: 'up' | 'down') => void;
  onShareWhatsApp: (deal: Deal) => void;
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  onSelectDeal,
  onVote,
  onShareWhatsApp,
}) => {
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deal.couponCode) return;
    navigator.clipboard.writeText(deal.couponCode);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  const getStoreBadgeColor = (store: string) => {
    switch (store) {
      case 'Amazon': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Mercado Livre': return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'Shopee': return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'Magalu': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'KaBuM!': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-purple-100 text-purple-900 border-purple-200';
    }
  };

  return (
    <article 
      onClick={() => onSelectDeal(deal)}
      className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group cursor-pointer relative"
    >
      {/* Top Meta Header: Temperature & Store */}
      <div className="p-3.5 pb-2 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
        {/* Temperature Voting Component (Estilo Promobit) */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs"
        >
          <button
            onClick={() => onVote(deal.id, 'down')}
            title="Votar Frio (-)"
            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>

          <span 
            className={`text-xs font-bold px-1 tabular-nums flex items-center gap-0.5 ${
              deal.temperature > 200 
                ? 'text-amber-600' 
                : deal.temperature > 100 
                ? 'text-orange-500' 
                : 'text-slate-600'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${deal.temperature > 150 ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            {deal.temperature}°
          </span>

          <button
            onClick={() => onVote(deal.id, 'up')}
            title="Votar Quente (+)"
            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Store Badge & Timestamp */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2 py-0.5 font-bold rounded border ${getStoreBadgeColor(deal.store)}`}>
            {deal.store}
          </span>
          <span className="text-slate-500 text-[11px]">
            {timeAgo(deal.postedAt)}
          </span>
        </div>
      </div>

      {/* Product Image Slot */}
      <div className="relative w-full h-48 bg-white p-4 flex items-center justify-center overflow-hidden border-b border-slate-100">
        {!imgError ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            onError={() => setImgError(true)}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4 text-center rounded-lg">
            <Sparkles className="w-8 h-8 mb-1 text-purple-400" />
            <span className="text-xs font-medium text-slate-500">{deal.store}</span>
            <span className="text-[11px] text-slate-400 mt-1">{deal.category}</span>
          </div>
        )}

        {deal.freeShipping && (
          <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Frete Grátis
          </span>
        )}

        {deal.isHot && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-xs">
            DESTAQUE 🔥
          </span>
        )}
      </div>

      {/* Content & Pricing */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2 leading-snug">
            {deal.title}
          </h2>

          {/* Pricing Block */}
          <div className="mt-3">
            {deal.originalPrice > deal.promoPrice && (
              <div className="flex items-center gap-2">
                <span className="text-xs line-through text-slate-500">
                  {formatBRL(deal.originalPrice)}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {deal.discountPercentage}% OFF
                </span>
              </div>
            )}
            
            <div className="text-xl font-extrabold text-slate-900 tabular-nums mt-0.5">
              {formatBRL(deal.promoPrice)}
            </div>

            <p className="text-xs text-slate-700 mt-1 line-clamp-1">
              {deal.paymentConditions}
            </p>
          </div>

          {/* Coupon Box if available */}
          {deal.couponCode && (
            <div 
              onClick={handleCopyCoupon}
              className="mt-3 p-2 bg-purple-50/80 border border-dashed border-purple-300 rounded-lg flex items-center justify-between text-xs text-purple-900 hover:bg-purple-100/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 font-mono font-bold tracking-wider">
                <span>Cupom:</span>
                <span className="bg-purple-200/80 px-1.5 py-0.5 rounded text-purple-950">
                  {deal.couponCode}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                {copiedCoupon ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          {/* Main Affiliate CTA Button */}
          <a
            href={deal.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1.5 group/btn"
          >
            <span>Pegar Promoção</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </a>

          {/* Share on WhatsApp */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShareWhatsApp(deal);
            }}
            title="Compartilhar no WhatsApp"
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Comments Count */}
          <button
            onClick={() => onSelectDeal(deal)}
            title="Ver Comentários"
            className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 text-xs cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-semibold tabular-nums">{deal.commentsCount}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
