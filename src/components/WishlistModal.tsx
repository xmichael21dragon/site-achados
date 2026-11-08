import React, { useState } from 'react';
import { Bell, Plus, Trash2, X, CheckCircle, Tag, ExternalLink } from 'lucide-react';
import { WishlistAlert, Deal } from '../types';
import { formatBRL } from '../lib/affiliate';
import { saveWishlistAlert, deleteWishlistAlert } from '../services/dealService';

interface WishlistModalProps {
  alerts: WishlistAlert[];
  onUpdateAlerts: (alerts: WishlistAlert[]) => void;
  deals: Deal[];
  onSelectDeal: (deal: Deal) => void;
  onClose: () => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  alerts,
  onUpdateAlerts,
  deals,
  onSelectDeal,
  onClose,
}) => {
  const [keyword, setKeyword] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    const parsedPrice = maxPrice ? parseFloat(maxPrice.replace(',', '.')) : undefined;
    const updated = saveWishlistAlert(keyword.trim(), parsedPrice);
    onUpdateAlerts(updated);
    setKeyword('');
    setMaxPrice('');
  };

  const handleDelete = (id: string) => {
    const updated = deleteWishlistAlert(id);
    onUpdateAlerts(updated);
  };

  // Check matching deals currently live
  const getMatchingDeals = (alertKeyword: string, alertMaxPrice?: number) => {
    const kw = alertKeyword.toLowerCase();
    return deals.filter((d) => {
      const match = d.title.toLowerCase().includes(kw) || d.category.toLowerCase().includes(kw);
      if (!match) return false;
      if (alertMaxPrice && d.promoPrice > alertMaxPrice) return false;
      return true;
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600 text-white rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Alerta de Desejos (Lista de Espera)
              </h2>
              <p className="text-xs text-slate-500">
                Cadastre o que você procura e veja os achadinhos compatíveis
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Add alert form */}
          <form onSubmit={handleAddAlert} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Criar Novo Alerta de Produto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-7">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nome do produto (ex: PlayStation 5, Air Fryer, iPhone 16)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div className="sm:col-span-5">
                <input
                  type="number"
                  step="0.01"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Preço Máx (opcional)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Adicionar Alerta
            </button>
          </form>

          {/* Active Alerts List */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Seus Alertas Ativos ({alerts.length})
            </h3>

            {alerts.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Nenhum alerta cadastrado ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {alerts.map((al) => {
                  const matches = getMatchingDeals(al.keyword, al.maxPrice);

                  return (
                    <div
                      key={al.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-bold text-slate-900">
                            {al.keyword}
                          </span>
                          {al.maxPrice && (
                            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Até {formatBRL(al.maxPrice)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleDelete(al.id)}
                          title="Excluir alerta"
                          className="text-slate-400 hover:text-red-600 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Matching deals found */}
                      {matches.length > 0 ? (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mb-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {matches.length} {matches.length === 1 ? 'achadinho encontrado!' : 'achadinhos encontrados!'}
                          </span>
                          <div className="space-y-1.5">
                            {matches.map((m) => (
                              <div
                                key={m.id}
                                onClick={() => {
                                  onSelectDeal(m);
                                  onClose();
                                }}
                                className="flex items-center justify-between p-2 bg-purple-50/60 hover:bg-purple-100/60 rounded-lg text-xs cursor-pointer transition-colors"
                              >
                                <span className="font-medium text-purple-950 truncate max-w-[280px]">
                                  {m.title}
                                </span>
                                <span className="font-extrabold text-slate-900 shrink-0">
                                  {formatBRL(m.promoPrice)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          O robô da nuvem está monitorando. Avisaremos assim que aparecer!
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
