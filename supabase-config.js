// Simple Supabase initialization - NO IMPORTS
const supabaseUrl = 'https://wsvijxebrqulwjrofiph.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzdmlqeGVicnF1bHdqcm9maXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MjY5MzksImV4cCI6MjA4MDMwMjkzOX0.WEEusKKxHZT_tld4Hg8bBPHOBuhrHpwZr_I3hwTW6n4';

// Wait for Supabase to load
if (typeof supabase === 'undefined') {
    // Supabase library not loaded yet
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = function() {
        initializeSupabase();
    };
    document.head.appendChild(script);
} else {
    initializeSupabase();
}

function initializeSupabase() {
    try {
        // Create Supabase client
        window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase initialized successfully');
        console.log('Supabase client created:', window.supabase);
        
        // Check if we can access auth
        if (window.supabase && window.supabase.auth) {
            console.log('✅ Supabase auth is available');
        } else {
            console.error('❌ Supabase auth is NOT available');
        }
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
    }
}