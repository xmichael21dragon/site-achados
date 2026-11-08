import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

const STORAGE_KEY = 'achadinhos_supabase_config';

// Defaults from Vite environment or localStorage
export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url,
          anonKey: parsed.anonKey,
          isConfigured: true,
        };
      }
    }
  } catch (err) {
    console.error('Error reading Supabase config from storage', err);
  }

  // Check Vite env
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey,
    isConfigured: Boolean(envUrl && envKey),
  };
}

export function saveSupabaseConfig(config: { url: string; anonKey: string }): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        url: config.url.trim(),
        anonKey: config.anonKey.trim(),
      })
    );
    // Reload client instance
    supabaseInstance = null;
  } catch (err) {
    console.error('Error saving Supabase config', err);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const config = getStoredSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.error('Failed to create Supabase client', err);
      return null;
    }
  }
  return null;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url.startsWith('https://')) {
      return { success: false, message: 'URL do Supabase inválida. Deve iniciar com https://' };
    }
    const testClient = createClient(url, anonKey);
    // Ping by querying public table or version
    const { error } = await testClient.from('deals').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's connected to Supabase project but needs schema
      if (error.message.includes('relation "public.deals" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: 'Conectado ao Supabase com sucesso! (Tabela "deals" ainda precisa ser criada com o script SQL fornecido)',
        };
      }
      return { success: false, message: `Erro ao testar: ${error.message}` };
    }
    return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
  } catch (err: any) {
    return { success: false, message: `Falha na conexão: ${err.message || 'Verifique URL e Anon Key'}` };
  }
}
