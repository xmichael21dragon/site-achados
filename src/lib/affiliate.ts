import { AffiliateSettings, StoreName } from '../types';

export const DEFAULT_AFFILIATE_SETTINGS: AffiliateSettings = {
  amazonTag: 'achadinhos-20',
  shopeeAffiliateId: 'achadinhos_shopee',
  mercadoLivreTracker: 'achadinhos_ml',
  magaluParceiro: 'achadinhosdaterra',
  aliexpressTrackingId: 'achadinhos_ali',
  customUtmSource: 'achadinhos_da_terra',
};

const STORAGE_KEY = 'achadinhos_affiliate_settings';

export function getStoredAffiliateSettings(): AffiliateSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_AFFILIATE_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Failed to read affiliate settings from localStorage', err);
  }
  return DEFAULT_AFFILIATE_SETTINGS;
}

export function saveAffiliateSettings(settings: AffiliateSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save affiliate settings', err);
  }
}

/**
 * Detects the store based on a URL string
 */
export function detectStoreFromUrl(url: string): StoreName {
  const lower = url.toLowerCase();
  if (lower.includes('amazon.com.br') || lower.includes('amzn.to')) return 'Amazon';
  if (lower.includes('mercadolivre.com.br') || lower.includes('mercadolivre.com') || lower.includes('meli.com')) return 'Mercado Livre';
  if (lower.includes('shopee.com.br') || lower.includes('shp.ee')) return 'Shopee';
  if (lower.includes('magazineluiza.com.br') || lower.includes('magalu.com') || lower.includes('magazinevoce.com.br')) return 'Magalu';
  if (lower.includes('kabum.com.br')) return 'KaBuM!';
  if (lower.includes('casasbahia.com.br')) return 'Casas Bahia';
  if (lower.includes('aliexpress.com')) return 'AliExpress';
  if (lower.includes('samsung.com')) return 'Samsung';
  if (lower.includes('fastshop.com.br')) return 'Fast Shop';
  return 'Outros';
}

/**
 * Transforms any raw product link into an Affiliate Monitized link
 * using the configured tags and affiliate protocols
 */
export function convertToAffiliateUrl(rawUrl: string, store?: StoreName, settings?: AffiliateSettings): string {
  if (!rawUrl) return '#';
  const config = settings || getStoredAffiliateSettings();
  const detectedStore = store || detectStoreFromUrl(rawUrl);

  try {
    // If it's already an affiliate shortlink (e.g. amzn.to, shp.ee, etc.) and user wants to pass through, return it
    const parsed = new URL(rawUrl);

    switch (detectedStore) {
      case 'Amazon': {
        // Amazon Associates format: tag=YOURTAG-20
        if (config.amazonTag) {
          parsed.searchParams.set('tag', config.amazonTag);
        }
        return parsed.toString();
      }

      case 'Shopee': {
        // Shopee affiliate link structure
        if (config.shopeeAffiliateId) {
          parsed.searchParams.set('aff_source', config.shopeeAffiliateId);
          parsed.searchParams.set('utm_source', config.customUtmSource || 'achadinhos');
        }
        return parsed.toString();
      }

      case 'Mercado Livre': {
        // Mercado Livre Affiliates parameter
        if (config.mercadoLivreTracker) {
          parsed.searchParams.set('matt_tool', config.mercadoLivreTracker);
          parsed.searchParams.set('utm_source', config.customUtmSource || 'achadinhos');
        }
        return parsed.toString();
      }

      case 'Magalu': {
        // Magazine Você / Magalu Parceiro
        if (config.magaluParceiro) {
          parsed.searchParams.set('parceiro', config.magaluParceiro);
        }
        return parsed.toString();
      }

      case 'AliExpress': {
        if (config.aliexpressTrackingId) {
          parsed.searchParams.set('aff_platform', 'link-c-tool');
          parsed.searchParams.set('sk', config.aliexpressTrackingId);
        }
        return parsed.toString();
      }

      default: {
        // Standard UTM tracking for any store
        parsed.searchParams.set('utm_source', config.customUtmSource || 'achadinhosdaterra');
        parsed.searchParams.set('utm_medium', 'afiliado');
        parsed.searchParams.set('utm_campaign', 'promobit_deals');
        return parsed.toString();
      }
    }
  } catch {
    // If URL parsing fails, return rawUrl
    return rawUrl;
  }
}

/**
 * Format currency to Brazilian Real (R$ 1.299,90)
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format date time relative (ex: "há 15 minutos", "há 2 horas")
 */
export function timeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'agora mesmo';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `há ${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'ontem';
  return `há ${diffInDays} dias`;
}
