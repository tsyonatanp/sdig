import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database tables structure
export const TABLES = {
  MESSAGES: 'messages',
  IMAGES: 'images',
  USERS: 'users',
  SETTINGS: 'settings'
};

// Message types
export const MESSAGE_TYPES = {
  NOTICE: 'notice',
  ANNOUNCEMENT: 'announcement',
  EMERGENCY: 'emergency',
  MAINTENANCE: 'maintenance'
};

// Image categories
export const IMAGE_CATEGORIES = {
  CAROUSEL: 'carousel',
  GALLERY: 'gallery',
  DOCUMENTS: 'documents'
}; 