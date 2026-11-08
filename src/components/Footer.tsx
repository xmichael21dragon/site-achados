import React from 'react';
import { ShieldCheck, MessageCircle, Send, Heart } from 'lucide-react';

interface FooterProps {
  onOpenVipGroups: () => void;
  onOpenWishlist: () => void;
  onSelectCategory: (cat: string) => void;
  onSelectStore: (store: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenVipGroups,
  onOpenWishlist,
  onSelectCategory,
  onSelectStore,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/Screenshot_20261106_113000_WhatsApp_de9e154a.jpg"
                alt="Achadinhos da Terra"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30"
              />
              <span className="font-extrabold text-base tracking-tight text-white">
                ACHADINHOS DA TERRA
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Seu portal diário de promoções, ofertas relâmpago e cupons de desconto verificados.
              Inspirado no Promobit, com curadoria humana e automação na nuvem para você nunca mais pagar caro.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onOpenVipGroups}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp VIP
              </button>
              <button
                onClick={onOpenVipGroups}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Telegram VIP
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Categorias Populares
            </h4>
            <ul className="space-y-2 text-slate-400">
              {['Celulares', 'Informática', 'Games', 'Casa e Cozinha', 'TV e Áudio'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Stores */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Lojas Parceiras
            </h4>
            <ul className="space-y-2 text-slate-400">
              {['Amazon', 'Mercado Livre', 'Shopee', 'Magalu', 'KaBuM!'].map((st) => (
                <li key={st}>
                  <button
                    onClick={() => onSelectStore(st)}
                    className="hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    Ofertas {st}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Recursos
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={onOpenWishlist}
                  className="hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Alerta de Desejos
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenVipGroups}
                  className="hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Grupos de WhatsApp
                </button>
              </li>
              <li>
                <span className="text-slate-500">Histórico de Preços</span>
              </li>
              <li>
                <span className="text-slate-500">Robô Oracle Cloud 24/7</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure & Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-slate-400 text-[11px] space-y-3">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Aviso de Transparência & Afiliados:</strong> O Achadinhos da Terra é uma plataforma de agregação
              e compartilhamento de ofertas. Ao clicar em um link e efetuar uma compra na loja parceira, podemos receber uma comissão
              de afiliado. Isso não altera o valor final pago pelo consumidor. Os preços e condições anunciados estão sujeitos a alteração pelas lojas a qualquer momento.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
            <div>
              © 2026 Achadinhos da Terra. Todos os direitos reservados.
            </div>
            <div className="flex items-center gap-1">
              Feito para economizar de verdade no Brasil
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
