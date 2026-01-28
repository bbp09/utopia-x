// ===================================
//  Supabase Configuration
// ===================================

// ⚠️ IMPORTANT: Replace these with your actual Supabase credentials
// Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Your public anon key

// Initialize Supabase client
let supabaseClient = null;

// Wait for Supabase library to load
function initSupabase() {
    if (supabaseClient !== null) {
        return supabaseClient;
    }
    
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase library not loaded');
        return null;
    }
    
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase initialized');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        return null;
    }
}

// Check if Supabase is configured
function isSupabaseConfigured() {
    return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}
