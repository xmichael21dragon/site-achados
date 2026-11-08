import React, { useState } from 'react';
import { 
  Ticket, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Store,
  Sparkles
} from 'lucide-react';
import { Coupon, StoreName } from '../types';
import { STORES_LIST } from '../data/mockData';

interface CouponsFeedProps {
  coupons: Coupon[];
  onSelectStore: (store: string) => void;
  selectedStore: string;
}

export const CouponsFeed: React.FC<CouponsFeedProps> = ({
  coupons,
  onSelectStore,
  selectedStore,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 2500);

    // Open store affiliate link
    window.open(coupon.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredCoupons = selectedStore
    ? coupons.filter((c) => c.store === selectedStore)
    : coupons;

  return (
    <section className="mb-12">
      {/* Header Banner for Coupons */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-200 mb-1">
              <Ticket className="w-4 h-4 text-purple-300" />
              <span>Central de Cupons Verificados</span>
              <span>·</span>
              <span className="text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Testados Hoje
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Cupons de Desconto Exclusivos
            </h2>
            <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl">
              Copie o código com 1 clique e seja redirecionado direto para a loja parceira com o cupom ativado.
            </p>
          </div>

          {/* Quick store tags in banner */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectStore('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !selectedStore ? 'bg-white text-purple-900 shadow-md' : 'bg-purple-700/60 text-white hover:bg-purple-700'
              }`}
            >
              Todos ({coupons.length})
            </button>
            {STORES_LIST.map((store) => (
              <button
                key={store.name}
                onClick={() => onSelectStore(selectedStore === store.name ? '' : store.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  selectedStore === store.name
                    ? 'bg-white text-purple-900 font-bold shadow-md'
                    : 'bg-purple-700/60 text-white hover:bg-purple-700'
                }`}
              >
                <span>{store.icon}</span>
                <span>{store.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCoupons.map((coupon) => {
          const isCopied = copiedId === coupon.id;

          return (
            <div
              key={coupon.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative group"
            >
              <div>
                {/* Store & Category */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                    <Store className="w-3 h-3 text-purple-600" />
                    {coupon.store}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verificado
                  </span>
                </div>

                {/* Discount Description */}
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {coupon.discountDescription}
                </h3>

                {coupon.minSpend ? (
                  <p className="text-xs text-slate-500 mt-1">
                    Gasto mínimo: <strong>R$ {coupon.minSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </p>
                ) : null}

                {/* Rules */}
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {coupon.rules}
                </p>
              </div>

              {/* Action Area */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {/* Coupon Code Pill */}
                  <div className="flex-1 bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-center font-mono font-extrabold text-sm text-slate-900 tracking-wider select-all">
                    {coupon.code}
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyCode(coupon)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-purple-700 hover:bg-purple-800 text-white'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Pegar Cupom
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Expira em breve
                  </span>
                  <a
                    href={coupon.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-0.5"
                  >
                    Ir para {coupon.store}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
