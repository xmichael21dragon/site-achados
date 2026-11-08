import React from 'react';
import { Flame, ShieldCheck, Zap, Bot, ArrowRight, MessageCircle } from 'lucide-react';
import { STORES_LIST } from '../data/mockData';
import { Deal } from '../types';

interface HeroBannerProps {
  topDeal?: Deal;
  onSelectDeal: (deal: Deal) => void;
  onOpenVipGroups: () => void;
  selectedStore: string;
  onSelectStore: (store: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  topDeal,
  onSelectDeal,
  onOpenVipGroups,
  selectedStore,
  onSelectStore,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl border border-purple-500/20 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Editorial Pitch & Stats */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
            <span className="flex items-center gap-1.5 bg-purple-900/60 border border-purple-400/30 px-3 py-1 rounded-full text-purple-200">
              <Bot className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              Robô Autônomo Oracle Cloud Ativo 24/7
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-400 font-medium">Links Verificados</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            As Melhores Ofertas e Cupons da Internet,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Mineradas em Tempo Real.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
            Economize todos os dias com descontos de até 80% na Amazon, Mercado Livre, Shopee, Magalu e KaBuM!.
            Atualizado automaticamente pelo nosso robô na nuvem.
          </p>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenVipGroups}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              Entrar nos Grupos VIP (WhatsApp & Telegram)
            </button>
            <div className="text-xs text-slate-400 flex items-center gap-2 px-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Links 100% seguros com cupons testados
            </div>
          </div>
        </div>

        {/* Right Side: Featured Hot Deal Spotlight */}
        {topDeal && (
          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-5 hover:border-purple-400/50 transition-all shadow-2xl group">
              <div className="flex items-center justify-between text-xs mb-3 text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  Destaque Mais Quente ({topDeal.temperature}°C)
                </span>
                <span className="bg-purple-600/80 text-white font-bold text-[11px] px-2 py-0.5 rounded">
                  {topDeal.store}
                </span>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-lg p-1.5 shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src={topDeal.imageUrl}
                    alt={topDeal.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-purple-200 transition-colors">
                    {topDeal.title}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xs line-through text-slate-400">
                      R$ {topDeal.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-lg font-extrabold text-emerald-400 tabular-nums">
                      R$ {topDeal.promoPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                      -{topDeal.discountPercentage}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 truncate mt-1">
                    {topDeal.paymentConditions}
                  </p>

                  <div className="mt-3">
                    <button
                      onClick={() => onSelectDeal(topDeal)}
                      className="w-full py-1.5 text-xs font-semibold text-center text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      Ver Detalhes do Achadinho
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Store Filter Bar */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="text-xs font-medium text-slate-300 mb-2.5 flex items-center justify-between">
          <span>Filtrar ofertas por loja parceira:</span>
          {selectedStore && (
            <button
              onClick={() => onSelectStore('')}
              className="text-xs text-purple-300 hover:text-white underline cursor-pointer"
            >
              Limpar filtro de loja
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => onSelectStore('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              !selectedStore
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            Todas as Lojas
          </button>
          {STORES_LIST.map((store) => (
            <button
              key={store.name}
              onClick={() => onSelectStore(selectedStore === store.name ? '' : store.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedStore === store.name
                  ? 'bg-purple-600 text-white font-bold ring-2 ring-white/30'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <span>{store.icon}</span>
              <span>{store.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
