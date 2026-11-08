import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { DealsFeed } from './components/DealsFeed';
import { CouponsFeed } from './components/CouponsFeed';
import { DealDetailModal } from './components/DealDetailModal';
import { WishlistModal } from './components/WishlistModal';
import { VipGroupsModal } from './components/VipGroupsModal';
import { PostDealModal } from './components/PostDealModal';
import { AdminBotModal } from './components/AdminBotModal';
import { Footer } from './components/Footer';
import { Deal, Coupon, WishlistAlert } from './types';
import { 
  fetchDeals, 
  fetchCoupons, 
  voteDeal, 
  getWishlistAlerts 
} from './services/dealService';
import { getSupabase } from './lib/supabase';
import { Check, Flame, MessageCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [wishlistAlerts, setWishlistAlerts] = useState<WishlistAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation & Filters
  const [activeTab, setActiveTab] = useState<'deals' | 'coupons' | 'hot'>('deals');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [selectedDealForDetail, setSelectedDealForDetail] = useState<Deal | null>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isVipGroupsOpen, setIsVipGroupsOpen] = useState(false);
  const [isPostDealOpen, setIsPostDealOpen] = useState(false);
  const [isAdminBotOpen, setIsAdminBotOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedDeals, loadedCoupons] = await Promise.all([
          fetchDeals(),
          fetchCoupons(),
        ]);
        setDeals(loadedDeals);
        setCoupons(loadedCoupons);
        setWishlistAlerts(getWishlistAlerts());
      } catch (err) {
        console.error('Error loading initial data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Supabase Realtime subscription for deals
    const supabase = getSupabase();
    if (supabase) {
      const channel = supabase
        .channel('public:deals')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deals' }, (payload) => {
          const newD = payload.new as any;
          if (newD) {
            setDeals((prev) => [
              {
                id: newD.id,
                title: newD.title,
                description: newD.description,
                imageUrl: newD.image_url,
                store: newD.store,
                originalPrice: Number(newD.original_price),
                promoPrice: Number(newD.promo_price),
                discountPercentage: newD.discount_percentage,
                paymentConditions: newD.payment_conditions,
                couponCode: newD.coupon_code,
                affiliateUrl: newD.affiliate_url,
                rawUrl: newD.raw_url,
                category: newD.category,
                temperature: newD.temperature || 100,
                upvotes: newD.upvotes || 1,
                downvotes: newD.downvotes || 0,
                commentsCount: newD.comments_count || 0,
                isExpired: Boolean(newD.is_expired),
                isHot: Boolean(newD.is_hot),
                freeShipping: Boolean(newD.free_shipping),
                postedAt: newD.posted_at || new Date().toISOString(),
                source: newD.source || 'oracle-cloud',
              },
              ...prev,
            ]);
            showToast(`🔥 Nova oferta minerada pelo robô: ${newD.title.substring(0, 30)}...`);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const handleVote = async (dealId: string, type: 'up' | 'down') => {
    const result = await voteDeal(dealId, type);
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? { ...d, temperature: result.temperature, upvotes: result.upvotes }
          : d
      )
    );
    showToast(type === 'up' ? '🔥 Voto quente registrado!' : '❄️ Voto frio registrado!');
  };

  const handleShareWhatsApp = (deal: Deal) => {
    setSelectedDealForDetail(null);
    setIsVipGroupsOpen(true);
  };

  const handleDealAdded = (newDeal: Deal) => {
    setDeals((prev) => [newDeal, ...prev]);
    showToast('🎉 Oferta publicada com sucesso com seu link de afiliado!');
  };

  // Top featured deal
  const topDeal = deals.find((d) => d.isHot) || deals[0];

  // Filter deals for Hot view
  const currentDeals = activeTab === 'hot'
    ? deals.filter((d) => d.temperature >= 200 || d.isHot)
    : selectedStore
    ? deals.filter((d) => d.store === selectedStore)
    : deals;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenVipGroups={() => setIsVipGroupsOpen(true)}
        onOpenPostDeal={() => setIsPostDealOpen(true)}
        onOpenAdminBot={() => setIsAdminBotOpen(true)}
        dealsCount={deals.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Hero Section */}
        {activeTab !== 'coupons' && !searchTerm && (
          <HeroBanner
            topDeal={topDeal}
            onSelectDeal={setSelectedDealForDetail}
            onOpenVipGroups={() => setIsVipGroupsOpen(true)}
            selectedStore={selectedStore}
            onSelectStore={setSelectedStore}
          />
        )}

        {/* Tab Switcher Body */}
        {activeTab === 'coupons' ? (
          <CouponsFeed
            coupons={coupons}
            selectedStore={selectedStore}
            onSelectStore={setSelectedStore}
          />
        ) : (
          <DealsFeed
            deals={currentDeals}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectDeal={setSelectedDealForDetail}
            onVote={handleVote}
            onShareWhatsApp={handleShareWhatsApp}
            searchTerm={searchTerm}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenVipGroups={() => setIsVipGroupsOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveTab('deals');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectStore={(st) => {
          setSelectedStore(st);
          setActiveTab('deals');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      {selectedDealForDetail && (
        <DealDetailModal
          deal={selectedDealForDetail}
          onClose={() => setSelectedDealForDetail(null)}
          onVote={handleVote}
          onShareWhatsApp={handleShareWhatsApp}
        />
      )}

      {isWishlistOpen && (
        <WishlistModal
          alerts={wishlistAlerts}
          onUpdateAlerts={setWishlistAlerts}
          deals={deals}
          onSelectDeal={setSelectedDealForDetail}
          onClose={() => setIsWishlistOpen(false)}
        />
      )}

      {isVipGroupsOpen && (
        <VipGroupsModal
          deals={deals}
          initialDeal={selectedDealForDetail}
          onClose={() => setIsVipGroupsOpen(false)}
        />
      )}

      {isPostDealOpen && (
        <PostDealModal
          onDealAdded={handleDealAdded}
          onClose={() => setIsPostDealOpen(false)}
        />
      )}

      {isAdminBotOpen && (
        <AdminBotModal
          onClose={() => setIsAdminBotOpen(false)}
          onDealAdded={handleDealAdded}
        />
      )}
    </div>
  );
}
