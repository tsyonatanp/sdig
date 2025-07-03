import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://uvtqpnnotvhusqqzhkvp.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dHFwbm5vdHZodXNxcXpoa3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzQ4MDMsImV4cCI6MjA2NzAxMDgwM30.P_HPn_F4Ndc1CkPfGs6nLwT3giK6jTqLFYhq2yjBOKA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 