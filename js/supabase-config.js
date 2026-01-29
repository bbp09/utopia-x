// ===================================
//  Supabase Configuration
// ===================================

// ⚠️ IMPORTANT: Replace these with your actual Supabase credentials
// Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

const SUPABASE_URL = 'https://idfpmynjfkvtcsqcjgnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZnBteW5qZmt2dGNzcWNqZ25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NzQ2NTgsImV4cCI6MjA4NTI1MDY1OH0.KFmClnG-XuW818uUIMlPW0yQ7UswXvIWh-ipv6z5p4I';

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

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Supabase config loaded');
    console.log('🔍 Configuration status:', isSupabaseConfigured() ? '✅ Configured' : '❌ Not configured');
    console.log('🌐 URL:', SUPABASE_URL);
    
    if (isSupabaseConfigured()) {
        // Initialize and expose globally
        setTimeout(() => {
            const client = initSupabase();
            if (client) {
                window.supabase = client;
                console.log('✅ Supabase client available globally as window.supabase');
            }
        }, 100); // Small delay to ensure Supabase library is loaded
    } else {
        console.warn('⚠️ Supabase not configured. Using fallback data.');
    }
});
