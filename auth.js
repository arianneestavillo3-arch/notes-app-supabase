class AuthManager {
    constructor() {
        this.isSignUp = false;
        this.user = null;
        this.init();
    }
    
    async init() {
        // Check for existing session
        try {
            const { data: { session }, error } = await window.supabase.auth.getSession();
            if (error) {
                console.error('Session error:', error);
                return;
            }
            
            if (session?.user) {
                this.user = session.user;
                console.log('Found existing session for user:', this.user.email);
                this.handleAuthChange(true);
            }
        } catch (error) {
            console.error('Init error:', error);
        }
        
        // Listen for auth changes
        window.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            
            if (session?.user) {
                this.user = session.user;
                this.handleAuthChange(true);
                
                // Update user email display
                const userEmailElement = document.getElementById('user-email');
                if (userEmailElement) {
                    userEmailElement.textContent = this.user.email;
                }
            } else {
                this.user = null;
                this.handleAuthChange(false);
            }
        });
    }
    
   async signUp(email, password, name) {
    console.log('🔑 Attempting sign up for:', email);
    
    // Check if supabase is available
    if (!window.supabase || !window.supabase.auth) {
        console.error('❌ Supabase auth not available');
        throw new Error('Supabase not initialized. Please refresh the page.');
    }
    
    try {
        const { data, error } = await window.supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name || email.split('@')[0],
                    created_at: new Date().toISOString()
                }
            }
        });
        
        if (error) {
            console.error('❌ Sign up error:', error);
            throw error;
        }
        
        console.log('✅ Sign up successful:', data);
        
        // Automatically sign in after sign up
        if (data.user && !data.session) {
            console.log('🔄 Auto-signing in after registration...');
            const { data: signInData, error: signInError } = await window.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (signInError) {
                console.error('Auto-signin error:', signInError);
                throw signInError;
            }
            
            return signInData;
        }
        
        return data;
    } catch (error) {
        console.error('❌ Sign up failed:', error);
        throw error;
    }
}
    
    async signIn(email, password) {
        console.log('Signing in user:', email);
        
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            console.error('Sign in error:', error);
            throw error;
        }
        
        console.log('Sign in successful:', data);
        return data;
    }
    
    async signOut() {
        const { error } = await window.supabase.auth.signOut();
        if (error) {
            console.error('Sign out error:', error);
            throw error;
        }
        console.log('Signed out successfully');
    }
    
    handleAuthChange(isAuthenticated) {
        console.log('Auth change - isAuthenticated:', isAuthenticated);
        
        const authSection = document.getElementById('auth-section');
        const appSection = document.getElementById('app-section');
        
        if (!authSection || !appSection) {
            console.error('Auth elements not found');
            return;
        }
        
        if (isAuthenticated) {
            authSection.classList.add('d-none');
            appSection.classList.remove('d-none');
        } else {
            authSection.classList.remove('d-none');
            appSection.classList.add('d-none');
        }
    }
    
    toggleAuthMode() {
        this.isSignUp = !this.isSignUp;
        
        const title = document.getElementById('auth-title');
        const submitBtn = document.getElementById('auth-submit');
        const toggleBtn = document.getElementById('toggle-auth');
        const nameField = document.getElementById('name-field');
        const authForm = document.getElementById('auth-form');
        
        if (!title || !submitBtn || !toggleBtn || !nameField || !authForm) {
            console.error('Auth form elements not found');
            return;
        }
        
        if (this.isSignUp) {
            title.textContent = 'Sign Up';
            submitBtn.textContent = 'Sign Up';
            toggleBtn.textContent = 'Already have an account? Sign In';
            nameField.classList.remove('d-none');
        } else {
            title.textContent = 'Sign In';
            submitBtn.textContent = 'Sign In';
            toggleBtn.textContent = 'Don\'t have an account? Sign Up';
            nameField.classList.add('d-none');
        }
        
        // Clear form errors
        const errorDiv = document.getElementById('auth-error');
        const successDiv = document.getElementById('auth-success');
        if (errorDiv) errorDiv.classList.add('d-none');
        if (successDiv) successDiv.classList.add('d-none');
        
        // Reset form
        authForm.reset();
    }
}

// Create global instance
window.AuthManager = AuthManager;