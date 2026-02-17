
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { ComplaintForm } from '../types';

// Priotitize Environment Variables (Vercel settings)
const SUPABASE_URL = (process && process.env && process.env.SUPABASE_URL) || localStorage.getItem('supabase_url') || 'https://sivsatmudoauqubvcfea.supabase.co';
const SUPABASE_KEY = (process && process.env && process.env.SUPABASE_ANON_KEY) || localStorage.getItem('supabase_key') || 'sb_publishable__ci9xP4VGClsJp6iYtmjWQ_CTHNJzP9';

let supabaseClient: any = null;

const getClient = () => {
  if (supabaseClient) return supabaseClient;
  
  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('your-project')) {
    console.warn("Supabase credentials are missing or default.");
  }

  console.log("Connecting to Supabase at:", SUPABASE_URL);

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
  });
  return supabaseClient;
};

const TABLE = 'complaints';

export const db = {
  saveConfig(url: string, key: string) {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    supabaseClient = null; // Reset client to pick up new config
  },

  async getAllComplaints(): Promise<ComplaintForm[]> {
    const { data, error } = await getClient()
      .from(TABLE)
      .select('*')
      .order('submittedAt', { ascending: false });
    
    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }
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
    
    if (error) {
      console.error("Save Error Details:", error);
      throw error;
    }
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
