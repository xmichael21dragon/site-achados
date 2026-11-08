export interface Deal {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  store: StoreName;
  storeLogo?: string;
  originalPrice: number;
  promoPrice: number;
  discountPercentage: number;
  paymentConditions: string; // Ex: "em 1x no Pix ou Cartão"
  couponCode?: string;
  affiliateUrl: string;
  rawUrl: string;
  category: string;
  temperature: number; // Ex: 120 graus (graus Promobit)
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  isExpired: boolean;
  isHot: boolean; // Destaque
  freeShipping?: boolean;
  postedAt: string; // ISO string
  source: 'bot' | 'manual' | 'oracle-cloud';
}

export type StoreName = 
  | 'Amazon'
  | 'Mercado Livre'
  | 'Shopee'
  | 'Magalu'
  | 'KaBuM!'
  | 'Casas Bahia'
  | 'AliExpress'
  | 'Samsung'
  | 'Fast Shop'
  | 'Gショック'
  | 'Outros';

export interface Coupon {
  id: string;
  store: StoreName;
  storeLogo?: string;
  code: string;
  discountDescription: string; // Ex: "R$ 50 OFF em compras acima de R$ 250"
  minSpend?: number;
  category?: string;
  expiresAt: string;
  affiliateUrl: string;
  verified: boolean;
  rules: string;
}

export interface Comment {
  id: string;
  dealId: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface WishlistAlert {
  id: string;
  keyword: string;
  maxPrice?: number;
  createdAt: string;
}

export interface AffiliateSettings {
  amazonTag: string;
  shopeeAffiliateId: string;
  mercadoLivreTracker: string;
  magaluParceiro: string;
  aliexpressTrackingId: string;
  customUtmSource: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export interface BotLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  dealTitle?: string;
  store?: string;
}
