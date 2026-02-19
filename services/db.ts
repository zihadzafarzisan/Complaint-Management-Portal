
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { ComplaintForm } from '../types';

const SUPABASE_URL = 'https://sivsatmudoauqubvcfea.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdnNhdG11ZG9hdXF1YnZjZmVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNTM2NjcsImV4cCI6MjA4NjgyOTY2N30.3M6Ed0u61uydZvOzTKW5IYFnpx2AJ1ZFL4xRNoaHyF8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

const TABLE = 'complaints';

export const db = {
  isReady() {
    return true;
  },

  async login(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    const isAdmin = data.user?.app_metadata?.role === 'admin';
    if (!isAdmin) {
      await supabase.auth.signOut();
      throw new Error('আপনার অ্যাডমিন এক্সেস নেই!');
    }
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    if (session.user.app_metadata.role !== 'admin') {
      await supabase.auth.signOut();
      return null;
    }
    return session;
  },

  async getAllComplaints(): Promise<ComplaintForm[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('submittedAt', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getComplaintsByMobile(mobile: string): Promise<ComplaintForm[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('mobile', mobile)
      .order('submittedAt', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async saveComplaint(complaint: ComplaintForm): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .insert([{ 
        ...complaint,
        isRead: false 
      }]);
    if (error) throw error;
  },

  async updateStatus(id: string, status: ComplaintForm['status']): Promise<void> {
    const { error } = await supabase.from(TABLE).update({ status }).eq('id', id);
    if (error) throw error;
  },

  async updateFeedback(id: string, feedback: string): Promise<void> {
    const { error } = await supabase.from(TABLE).update({ adminFeedback: feedback }).eq('id', id);
    if (error) throw error;
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).update({ isRead: true }).eq('id', id);
    if (error) throw error;
  },

  async deletePermanently(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  subscribeToComplaints(callback: () => void) {
    return supabase
      .channel('public:complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, callback)
      .subscribe();
  },

  saveConfig(url: string, key: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_key', key);
    }
  }
};
