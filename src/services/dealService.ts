import { INITIAL_COUPONS, INITIAL_DEALS } from '../data/mockData';
import { convertToAffiliateUrl, detectStoreFromUrl, getStoredAffiliateSettings } from '../lib/affiliate';
import { getSupabase } from '../lib/supabase';
import { BotLog, Comment, Coupon, Deal, WishlistAlert } from '../types';

const DEALS_STORAGE_KEY = 'achadinhos_deals_cache';
const COUPONS_STORAGE_KEY = 'achadinhos_coupons_cache';
const WISHLIST_STORAGE_KEY = 'achadinhos_wishlist_cache';
const COMMENTS_STORAGE_KEY = 'achadinhos_comments_cache';
const VOTED_DEALS_KEY = 'achadinhos_voted_deals';

// Initialize cache with default data if empty
function getLocalDeals(): Deal[] {
  try {
    const raw = localStorage.getItem(DEALS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading deals from localStorage', err);
  }
  localStorage.setItem(DEALS_STORAGE_KEY, JSON.stringify(INITIAL_DEALS));
  return INITIAL_DEALS;
}

function saveLocalDeals(deals: Deal[]): void {
  try {
    localStorage.setItem(DEALS_STORAGE_KEY, JSON.stringify(deals));
  } catch (err) {
    console.error('Error saving deals to localStorage', err);
  }
}

function getLocalCoupons(): Coupon[] {
  try {
    const raw = localStorage.getItem(COUPONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading coupons from localStorage', err);
  }
  localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(INITIAL_COUPONS));
  return INITIAL_COUPONS;
}

export async function fetchDeals(): Promise<Deal[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('posted_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database snake_case to frontend camelCase
        const mapped: Deal[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d.description || '',
          imageUrl: d.image_url,
          store: d.store,
          originalPrice: Number(d.original_price),
          promoPrice: Number(d.promo_price),
          discountPercentage: d.discount_percentage,
          paymentConditions: d.payment_conditions || 'em 1x no Pix ou Cartão',
          couponCode: d.coupon_code || '',
          affiliateUrl: d.affiliate_url,
          rawUrl: d.raw_url || '',
          category: d.category || 'Geral',
          temperature: d.temperature || 100,
          upvotes: d.upvotes || 0,
          downvotes: d.downvotes || 0,
          commentsCount: d.comments_count || 0,
          isExpired: Boolean(d.is_expired),
          isHot: Boolean(d.is_hot),
          freeShipping: Boolean(d.free_shipping),
          postedAt: d.posted_at,
          source: d.source || 'oracle-cloud',
        }));
        saveLocalDeals(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage', err);
    }
  }
  return getLocalDeals();
}

export async function fetchCoupons(): Promise<Coupon[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: Coupon[] = data.map((c: any) => ({
          id: c.id,
          store: c.store,
          code: c.code,
          discountDescription: c.discount_description,
          minSpend: Number(c.min_spend) || 0,
          category: c.category || 'Geral',
          expiresAt: c.expires_at,
          affiliateUrl: c.affiliate_url,
          verified: Boolean(c.verified),
          rules: c.rules || '',
        }));
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase coupons fetch failed', err);
    }
  }
  return getLocalCoupons();
}

export async function voteDeal(dealId: string, type: 'up' | 'down'): Promise<{ temperature: number; upvotes: number }> {
  const votedKey = `${VOTED_DEALS_KEY}_${dealId}`;
  if (localStorage.getItem(votedKey)) {
    // Already voted
    const deals = getLocalDeals();
    const existing = deals.find((d) => d.id === dealId);
    return {
      temperature: existing?.temperature || 100,
      upvotes: existing?.upvotes || 0,
    };
  }

  localStorage.setItem(votedKey, type);
  const deals = getLocalDeals();
  const deal = deals.find((d) => d.id === dealId);

  if (deal) {
    if (type === 'up') {
      deal.upvotes += 1;
      deal.temperature += 15;
    } else {
      deal.downvotes += 1;
      deal.temperature = Math.max(0, deal.temperature - 10);
    }
    saveLocalDeals(deals);

    // Sync to Supabase in background
    const supabase = getSupabase();
    if (supabase) {
      supabase
        .from('deals')
        .update({
          upvotes: deal.upvotes,
          downvotes: deal.downvotes,
          temperature: deal.temperature,
        })
        .eq('id', dealId)
        .then();
    }
    return { temperature: deal.temperature, upvotes: deal.upvotes };
  }

  return { temperature: 100, upvotes: 1 };
}

export async function addDeal(newDeal: Omit<Deal, 'id' | 'temperature' | 'upvotes' | 'downvotes' | 'commentsCount' | 'postedAt'>): Promise<Deal> {
  const settings = getStoredAffiliateSettings();
  const store = newDeal.store || detectStoreFromUrl(newDeal.rawUrl || '');
  const affiliateUrl = convertToAffiliateUrl(newDeal.rawUrl || newDeal.affiliateUrl, store, settings);

  const fullDeal: Deal = {
    ...newDeal,
    id: `deal-${Date.now()}`,
    store,
    affiliateUrl,
    temperature: 150,
    upvotes: 1,
    downvotes: 0,
    commentsCount: 0,
    postedAt: new Date().toISOString(),
  };

  // Save to local storage
  const currentDeals = getLocalDeals();
  const updated = [fullDeal, ...currentDeals];
  saveLocalDeals(updated);

  // If Supabase is connected, insert record
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('deals').insert({
        id: fullDeal.id,
        title: fullDeal.title,
        description: fullDeal.description || '',
        image_url: fullDeal.imageUrl,
        store: fullDeal.store,
        original_price: fullDeal.originalPrice,
        promo_price: fullDeal.promoPrice,
        discount_percentage: fullDeal.discountPercentage,
        payment_conditions: fullDeal.paymentConditions,
        coupon_code: fullDeal.couponCode || '',
        affiliate_url: fullDeal.affiliateUrl,
        raw_url: fullDeal.rawUrl || '',
        category: fullDeal.category,
        temperature: fullDeal.temperature,
        upvotes: fullDeal.upvotes,
        downvotes: fullDeal.downvotes,
        comments_count: 0,
        is_expired: false,
        is_hot: fullDeal.isHot,
        free_shipping: fullDeal.freeShipping,
        source: fullDeal.source,
      });
    } catch (err) {
      console.error('Failed to insert into Supabase', err);
    }
  }

  return fullDeal;
}

export async function fetchComments(dealId: string): Promise<Comment[]> {
  const raw = localStorage.getItem(`${COMMENTS_STORAGE_KEY}_${dealId}`);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }

  // Initial comments generator for demo realism
  const defaults: Comment[] = [
    {
      id: `comm-1`,
      dealId,
      author: 'Lucas_Economia',
      content: 'Preço excelente! Já comprei no Pix e já emitiram a nota fiscal.',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      likes: 12,
    },
    {
      id: `comm-2`,
      dealId,
      author: 'Mariana_Tech',
      content: 'O cupom funcionou certinho aqui, deu mais R$ 50 de desconto!',
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      likes: 7,
    },
  ];
  return defaults;
}

export async function addComment(dealId: string, content: string, author = 'Membro Achadinhos'): Promise<Comment> {
  const comment: Comment = {
    id: `comm-${Date.now()}`,
    dealId,
    author,
    content,
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  const existing = await fetchComments(dealId);
  const updated = [comment, ...existing];
  localStorage.setItem(`${COMMENTS_STORAGE_KEY}_${dealId}`, JSON.stringify(updated));

  // Update deal comment count in cache
  const deals = getLocalDeals();
  const d = deals.find((item) => item.id === dealId);
  if (d) {
    d.commentsCount = (d.commentsCount || 0) + 1;
    saveLocalDeals(deals);
  }

  return comment;
}

export function getWishlistAlerts(): WishlistAlert[] {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading wishlist', err);
  }
  return [
    { id: 'w1', keyword: 'PlayStation 5', maxPrice: 3200, createdAt: new Date().toISOString() },
    { id: 'w2', keyword: 'Air Fryer', maxPrice: 200, createdAt: new Date().toISOString() },
  ];
}

export function saveWishlistAlert(keyword: string, maxPrice?: number): WishlistAlert[] {
  const current = getWishlistAlerts();
  const newAlert: WishlistAlert = {
    id: `wish-${Date.now()}`,
    keyword,
    maxPrice,
    createdAt: new Date().toISOString(),
  };
  const updated = [newAlert, ...current];
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteWishlistAlert(id: string): WishlistAlert[] {
  const current = getWishlistAlerts();
  const updated = current.filter((item) => item.id !== id);
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
