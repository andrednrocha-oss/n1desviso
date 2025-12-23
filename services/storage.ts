
import { Deviation } from '../types.ts';
import { supabase } from './supabase.ts';

const LOCAL_STORAGE_KEY = 'devitrack_deviations_offline_fallback';

export const saveDeviation = async (deviation: Deviation): Promise<void> => {
  if (!supabase) {
    const existing = await getDeviations();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...existing, deviation]));
    return;
  }

  const { error } = await supabase
    .from('deviations')
    .insert([deviation]);

  if (error) {
    throw error;
  }
};

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
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  }

  return data || [];
};

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
    throw error;
  }
};
