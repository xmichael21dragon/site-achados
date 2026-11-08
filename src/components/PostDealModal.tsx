import React, { useState } from 'react';
import { 
  X, 
  Link, 
  Sparkles, 
  Plus, 
  Check, 
  Store, 
  DollarSign, 
  Percent, 
  Image as ImageIcon 
} from 'lucide-react';
import { Deal, StoreName } from '../types';
import { detectStoreFromUrl, convertToAffiliateUrl } from '../lib/affiliate';
import { addDeal } from '../services/dealService';
import { CATEGORIES_LIST } from '../data/mockData';

interface PostDealModalProps {
  onDealAdded: (newDeal: Deal) => void;
  onClose: () => void;
}

export const PostDealModal: React.FC<PostDealModalProps> = ({
  onDealAdded,
  onClose,
}) => {
  const [mode, setMode] = useState<'url' | 'manual'>('url');
  const [rawUrl, setRawUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Manual fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [store, setStore] = useState<StoreName>('Amazon');
  const [originalPrice, setOriginalPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [paymentConditions, setPaymentConditions] = useState('em 1x no Pix ou Cartão');
  const [couponCode, setCouponCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Celulares');
  const [freeShipping, setFreeShipping] = useState(true);

  // URL Simulator / Extractor
  const handleExtractFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawUrl.trim()) return;

    setIsExtracting(true);
    const detectedStore = detectStoreFromUrl(rawUrl);

    // Simulate smart metadata extraction
    setTimeout(async () => {
      // Mock realistic extracted data based on URL keyword hints
      const lower = rawUrl.toLowerCase();
      let extractedTitle = 'Produto em Promoção Imperdível';
      let extractedPrice = 199.90;
      let extractedOriginal = 299.90;
      let extractedImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
      let extractedCategory = 'Informática';

      if (lower.includes('iphone') || lower.includes('celular') || lower.includes('samsung')) {
        extractedTitle = 'Smartphone em Super Promoção Verificada';
        extractedPrice = 2499.00;
        extractedOriginal = 3299.00;
        extractedImg = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';
        extractedCategory = 'Celulares';
      } else if (lower.includes('playstation') || lower.includes('xbox') || lower.includes('game')) {
        extractedTitle = 'Console / Acessório Gamer com Desconto';
        extractedPrice = 399.00;
        extractedOriginal = 599.00;
        extractedImg = 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&auto=format&fit=crop&q=80';
        extractedCategory = 'Games';
      } else if (lower.includes('air') || lower.includes('fryer') || lower.includes('panela')) {
        extractedTitle = 'Air Fryer Fritadeira Sem Óleo com Frete Rápido';
        extractedPrice = 189.90;
        extractedOriginal = 299.90;
        extractedImg = 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80';
        extractedCategory = 'Casa e Cozinha';
      }

      const discount = Math.round(((extractedOriginal - extractedPrice) / extractedOriginal) * 100);

      const created = await addDeal({
        title: extractedTitle,
        description: `Achadinho minerado automaticamente da loja ${detectedStore}.`,
        imageUrl: extractedImg,
        store: detectedStore,
        originalPrice: extractedOriginal,
        promoPrice: extractedPrice,
        discountPercentage: discount,
        paymentConditions: 'em 1x no Pix ou Cartão',
        couponCode: '',
        affiliateUrl: convertToAffiliateUrl(rawUrl, detectedStore),
        rawUrl: rawUrl,
        category: extractedCategory,
        isExpired: false,
        isHot: discount >= 30,
        freeShipping: true,
        source: 'manual',
      });

      setIsExtracting(false);
      onDealAdded(created);
      onClose();
    }, 800);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promoPrice) return;

    const promo = parseFloat(promoPrice.replace(',', '.'));
    const orig = originalPrice ? parseFloat(originalPrice.replace(',', '.')) : promo;
    const discount = orig > promo ? Math.round(((orig - promo) / orig) * 100) : 0;

    const fallbackImg = imageUrl.trim() || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

    const created = await addDeal({
      title: title.trim(),
      description: description.trim(),
      imageUrl: fallbackImg,
      store,
      originalPrice: orig,
      promoPrice: promo,
      discountPercentage: discount,
      paymentConditions: paymentConditions.trim() || 'em 1x no Pix ou Cartão',
      couponCode: couponCode.trim(),
      affiliateUrl: convertToAffiliateUrl(rawUrl || '#', store),
      rawUrl: rawUrl.trim(),
      category,
      isExpired: false,
      isHot: discount >= 25,
      freeShipping,
      source: 'manual',
    });

    onDealAdded(created);
    onClose();
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
            <div className="p-2 bg-purple-700 text-white rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Postar Novo Achadinho
              </h2>
              <p className="text-xs text-slate-500">
                Seu link será convertido com suas tags de afiliado automaticamente
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

        {/* Tab switch */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <button
            onClick={() => setMode('url')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'url' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            Extração Rápida por Link (IA/Scraper)
          </button>

          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'manual' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4 text-slate-600" />
            Preenchimento Manual
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {mode === 'url' ? (
            <form onSubmit={handleExtractFromUrl} className="space-y-4">
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-purple-900 leading-relaxed">
                Cole o link de qualquer produto da <strong>Amazon, Mercado Livre, Shopee, Magalu ou KaBuM!</strong>.
                O motor vai detectar a loja, anexar o seu código de afiliado e publicar a oferta.
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Link do Produto (URL):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    value={rawUrl}
                    onChange={(e) => setRawUrl(e.target.value)}
                    placeholder="https://www.amazon.com.br/dp/... ou shopee.com.br/..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isExtracting || !rawUrl.trim()}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Processando e Injetando Tag de Afiliado...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extrair e Publicar Oferta Agora
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Título do Produto:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Apple iPhone 16 128GB Preto"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Loja:</label>
                  <select
                    value={store}
                    onChange={(e) => setStore(e.target.value as StoreName)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                  >
                    <option value="Amazon">Amazon</option>
                    <option value="Mercado Livre">Mercado Livre</option>
                    <option value="Shopee">Shopee</option>
                    <option value="Magalu">Magalu</option>
                    <option value="KaBuM!">KaBuM!</option>
                    <option value="Casas Bahia">Casas Bahia</option>
                    <option value="AliExpress">AliExpress</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Categoria:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                  >
                    {CATEGORIES_LIST.filter(c => c !== 'Todas').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Preço Original (De):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Ex: 349.90"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Preço Promocional (Por):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(e.target.value)}
                    placeholder="Ex: 199.90"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Condição de Pagamento:</label>
                <input
                  type="text"
                  value={paymentConditions}
                  onChange={(e) => setPaymentConditions(e.target.value)}
                  placeholder="Ex: em 1x no Pix ou até 10x sem juros"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Cupom (Opcional):</label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Ex: PROMO10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Link do Produto:</label>
                  <input
                    type="url"
                    value={rawUrl}
                    onChange={(e) => setRawUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">URL da Imagem:</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... ou link direto da foto"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="shippingCheck"
                  checked={freeShipping}
                  onChange={(e) => setFreeShipping(e.target.checked)}
                  className="rounded text-purple-600"
                />
                <label htmlFor="shippingCheck" className="font-medium text-slate-700">
                  Possui Frete Grátis
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus className="w-4 h-4" />
                Publicar Achadinho
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
