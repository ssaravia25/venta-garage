import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function isConfigured() {
  return !!(supabaseUrl && supabaseKey);
}

const supabase = isConfigured() ? createClient(supabaseUrl, supabaseKey) : null;

// Devuelve { value: string } o null — misma interfaz que usaba window.storage
export async function storageGet(key) {
  if (supabase) {
    try {
      const { data } = await supabase
        .from('kv_store')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      return data ? { value: data.value } : null;
    } catch { return null; }
  }
  // Fallback: localStorage (funciona en el mismo dispositivo)
  const value = localStorage.getItem(key);
  return value ? { value } : null;
}

export async function storageSet(key, value) {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('kv_store')
        .upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('storageSet error:', e);
      return false;
    }
  }
  // Fallback: localStorage
  localStorage.setItem(key, value);
  return true;
}
