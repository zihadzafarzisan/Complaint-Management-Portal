
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { ComplaintForm } from '../types';

// Hardcoded defaults as final safety, but environment variables are prioritized
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sivsatmudoauqubvcfea.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable__ci9xP4VGClsJp6iYtmjWQ_CTHNJzP9';

let supabaseClient: any = null;

const getClient = () => {
  if (supabaseClient) return supabaseClient;
  
  // Local storage can override environment (useful for testing different DBs)
  const url = localStorage.getItem('supabase_url') || SUPABASE_URL;
  const key = localStorage.getItem('supabase_key') || SUPABASE_KEY;

  supabaseClient = createClient(url, key, {
    auth: { persistSession: false }
  });
  return supabaseClient;
};

const TABLE = 'complaints';

export const db = {
  // Save configuration and reset the client instance
  saveConfig(url: string, key: string) {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    supabaseClient = null;
  },

  async getAllComplaints(): Promise<ComplaintForm[]> {
    const { data, error } = await getClient()
      .from(TABLE)
      .select('*')
      .order('submittedAt', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getComplaintsByMobile(mobile: string): Promise<ComplaintForm[]> {
    const { data, error } = await getClient()
      .from(TABLE)
      .select('*')
      .eq('mobile', mobile)
      .is('deletedAt', null)
      .order('submittedAt', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async saveComplaint(complaint: ComplaintForm): Promise<void> {
    const { error } = await getClient()
      .from(TABLE)
      .insert([complaint]);
    
    if (error) throw error;
  },

  async updateStatus(id: string, status: ComplaintForm['status']): Promise<void> {
    const { error } = await getClient()
      .from(TABLE)
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
  },

  async moveToTrash(id: string): Promise<void> {
    const { error } = await getClient()
      .from(TABLE)
      .update({ deletedAt: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async restore(id: string): Promise<void> {
    const { error } = await getClient()
      .from(TABLE)
      .update({ deletedAt: null })
      .eq('id', id);
    
    if (error) throw error;
  },

  subscribeToComplaints(callback: () => void) {
    return getClient()
      .channel('public:complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, callback)
      .subscribe();
  }
};
