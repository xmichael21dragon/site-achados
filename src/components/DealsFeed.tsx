import React, { useState } from 'react';
import { 
  Flame, 
  Clock, 
  ArrowDownUp, 
  Percent, 
  LayoutGrid, 
  List, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Deal } from '../types';
import { DealCard } from './DealCard';
import { CATEGORIES_LIST } from '../data/mockData';

interface DealsFeedProps {
  deals: Deal[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectDeal: (deal: Deal) => void;
  onVote: (dealId: string, type: 'up' | 'down') => void;
  onShareWhatsApp: (deal: Deal) => void;
  searchTerm: string;
}

type SortOption = 'hot' | 'recent' | 'price_asc' | 'discount_desc';

export const DealsFeed: React.FC<DealsFeedProps> = ({
  deals,
  selectedCategory,
  onSelectCategory,
  onSelectDeal,
  onVote,
  onShareWhatsApp,
  searchTerm,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  // Filter & Sort
  const filteredDeals = deals.filter((deal) => {
    // Category match
    const categoryMatch = selectedCategory === 'Todas' || deal.category === selectedCategory;

    // Search query match
    const query = searchTerm.toLowerCase();
    const searchMatch = !searchTerm || 
      deal.title.toLowerCase().includes(query) ||
      deal.store.toLowerCase().includes(query) ||
      deal.category.toLowerCase().includes(query) ||
      (deal.couponCode && deal.couponCode.toLowerCase().includes(query));

    return categoryMatch && searchMatch;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case 'hot':
        return b.temperature - a.temperature;
      case 'recent':
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      case 'price_asc':
        return a.promoPrice - b.promoPrice;
      case 'discount_desc':
        return b.discountPercentage - a.discountPercentage;
      default:
        return 0;
    }
  });

  return (
    <section className="mb-12">
      {/* Category Horizontal Filter Bar */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES_LIST.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Control Toolbar: Sort Tabs & Layout Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setSortBy('hot')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              sortBy === 'hot' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Mais Quentes
          </button>

          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              sortBy === 'recent' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            Mais Recentes
          </button>

          <button
            onClick={() => setSortBy('discount_desc')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              sortBy === 'discount_desc' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-emerald-600" />
            Maior Desconto
          </button>

          <button
            onClick={() => setSortBy('price_asc')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              sortBy === 'price_asc' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-blue-600" />
            Menor Preço
          </button>
        </div>

        {/* Counter and Grid/List Mode */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
          <span>
            Mostrando <strong>{sortedDeals.length}</strong> {sortedDeals.length === 1 ? 'oferta' : 'ofertas'}
          </span>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              title="Grade"
              className={`p-1.5 rounded cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              title="Lista Compacta"
              className={`p-1.5 rounded cursor-pointer ${
                viewMode === 'compact' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Deals Grid / List */}
      {sortedDeals.length > 0 ? (
        <div 
          className={
            viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              : "grid grid-cols-1 md:grid-cols-2 gap-4"
          }
        >
          {sortedDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onSelectDeal={onSelectDeal}
              onVote={onVote}
              onShareWhatsApp={onShareWhatsApp}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Nenhuma oferta encontrada
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Tente buscar por termos mais genéricos ou limpe os filtros ativos.
          </p>
          <button
            onClick={() => {
              onSelectCategory('Todas');
            }}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Ver Todas as Ofertas
          </button>
        </div>
      )}
    </section>
  );
};
