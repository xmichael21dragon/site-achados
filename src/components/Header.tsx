import React, { useState } from 'react';
import { 
  Search, 
  Flame, 
  Ticket, 
  Bell, 
  Users, 
  PlusCircle, 
  Settings, 
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { CATEGORIES_LIST } from '../data/mockData';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeTab: 'deals' | 'coupons' | 'hot';
  onTabChange: (tab: 'deals' | 'coupons' | 'hot') => void;
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  onOpenWishlist: () => void;
  onOpenVipGroups: () => void;
  onOpenPostDeal: () => void;
  onOpenAdminBot: () => void;
  dealsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  selectedCategory,
  onCategorySelect,
  onOpenWishlist,
  onOpenVipGroups,
  onOpenPostDeal,
  onOpenAdminBot,
  dealsCount,
}) => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
      {/* Top Bar Contract (1 row, 3 zones) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand Wordmark with Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <a 
              href="/" 
              className="flex items-center gap-2.5 group"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('deals');
                onCategorySelect('Todas');
                onSearchChange('');
              }}
            >
              <img 
                src="/assets/aistudio/Screenshot_20261106_113000_WhatsApp_de9e154a.jpg" 
                alt="Achadinhos da Terra Logo" 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-600/30 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 bg-clip-text text-transparent">
                  ACHADINHOS DA TERRA
                </span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest -mt-1 hidden sm:block">
                  Ofertas & Cupons no Estilo Promobit
                </span>
              </div>
            </a>
          </div>

          {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            <button
              onClick={() => onTabChange('deals')}
              className={`hover:text-purple-700 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'deals' ? 'border-purple-600 text-purple-700 font-semibold' : 'border-transparent'
              }`}
            >
              Ofertas
            </button>
            <button
              onClick={() => onTabChange('hot')}
              className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1 border-b-2 ${
                activeTab === 'hot' ? 'border-amber-600 text-amber-600 font-semibold' : 'border-transparent'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              Mais Quentes
            </button>
            <button
              onClick={() => onTabChange('coupons')}
              className={`hover:text-purple-700 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1 border-b-2 ${
                activeTab === 'coupons' ? 'border-purple-600 text-purple-700 font-semibold' : 'border-transparent'
              }`}
            >
              <Ticket className="w-4 h-4 text-purple-600" />
              Cupons de Desconto
            </button>
            <button
              onClick={onOpenWishlist}
              className="hover:text-purple-700 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1 text-slate-600"
            >
              <Bell className="w-4 h-4 text-slate-500" />
              Alerta de Desejos
            </button>
            <button
              onClick={onOpenVipGroups}
              className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 rounded-md"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Grupos VIP
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Admin/Bot Center */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenPostDeal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Postar Oferta</span>
              <span className="sm:hidden">Postar</span>
            </button>

            <button
              onClick={onOpenAdminBot}
              title="Gerenciador de Robô Oracle Cloud & Supabase"
              className="p-2 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg border border-slate-200 transition-colors relative"
            >
              <Settings className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Search & Mobile Navigation */}
        <div className="py-2.5 border-t border-slate-100 flex flex-col md:flex-row items-center gap-3">
          {/* Categories Dropdown */}
          <div className="relative shrink-0 w-full md:w-auto">
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="w-full md:w-auto flex items-center justify-between gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
            >
              <span>Categoria: <strong>{selectedCategory}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showCategoryMenu && (
              <div 
                className="absolute left-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                onMouseLeave={() => setShowCategoryMenu(false)}
              >
                {CATEGORIES_LIST.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      onCategorySelect(cat);
                      setShowCategoryMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-purple-50 text-purple-700 font-semibold' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input Bar */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar ofertas, cupons ou lojas (ex: iPhone, PS5, Air Fryer, Amazon)..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-100/90 border border-transparent focus:border-purple-500 focus:bg-white focus:outline-none rounded-lg text-slate-900 placeholder-slate-400 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Mobile Fast Links */}
          <div className="flex lg:hidden items-center justify-between w-full gap-2 text-xs font-medium text-slate-600 overflow-x-auto pb-1">
            <button
              onClick={() => onTabChange('deals')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
                activeTab === 'deals' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100'
              }`}
            >
              Ofertas
            </button>
            <button
              onClick={() => onTabChange('hot')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'hot' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              Mais Quentes
            </button>
            <button
              onClick={() => onTabChange('coupons')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'coupons' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100'
              }`}
            >
              <Ticket className="w-3 h-3 text-purple-600" />
              Cupons
            </button>
            <button
              onClick={onOpenWishlist}
              className="px-2.5 py-1 rounded-md whitespace-nowrap bg-slate-100 flex items-center gap-1"
            >
              <Bell className="w-3 h-3" />
              Alertas
            </button>
            <button
              onClick={onOpenVipGroups}
              className="px-2.5 py-1 rounded-md whitespace-nowrap bg-emerald-100 text-emerald-800 flex items-center gap-1 font-semibold"
            >
              Grupos VIP
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
