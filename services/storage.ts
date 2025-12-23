
import { Deviation } from '../types';
import { supabase } from './supabase';

const LOCAL_STORAGE_KEY = 'devitrack_deviations_offline_fallback';

/**
 * Saves a deviation. Prioritizes Supabase if configured, 
 * otherwise falls back to browser localStorage.
 */
export const saveDeviation = async (deviation: Deviation): Promise<void> => {
  if (!supabase) {
    console.warn('Supabase not configured. Using localStorage fallback.');
    const existing = await getDeviations();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...existing, deviation]));
    return;
  }

  const { error } = await supabase
    .from('deviations')
    .insert([deviation]);

  if (error) {
    console.error('Error saving deviation to Supabase:', error);
    throw error;
  }
};

/**
 * Retrieves all deviations. Prioritizes Supabase if configured, 
 * otherwise falls back to browser localStorage.
 */
export const getDeviations = async (): Promise<Deviation[]> => {
  if (!supabase) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  const { data, error } = await supabase
    .from('deviations')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching deviations from Supabase:', error);
    // Even if Supabase is configured, if the request fails, we could try loading from local cache
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  }

  return data || [];
};

/**
 * Deletes a deviation by ID.
 */
export const deleteDeviation = async (id: string): Promise<void> => {
  if (!supabase) {
    const existing = await getDeviations();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing.filter(d => d.id !== id)));
    return;
  }

  const { error } = await supabase
    .from('deviations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting deviation from Supabase:', error);
    throw error;
  }
};
