app . js 
class NotesApp {
    constructor() {
        this.auth = null;
        this.notesManager = null;
        this.storageManager = null;
        this.currentNoteId = null;
        this.selectedFiles = [];
        
        console.log('NotesApp initializing...');
        this.init();
    }
    
    async init() {
        try {
            // Wait for supabase to load
            if (!window.supabase) {
                console.error('Supabase not loaded');
                setTimeout(() => this.init(), 100);
                return;
            }
            
            console.log('Supabase loaded, initializing auth...');
            this.auth = new AuthManager();
            
            // Setup event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('App initialization error:', error);
        }
    }
    
    setupEventListeners() {
        // Auth form
        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleAuth(e));
        }
        
        // Toggle auth mode
        const toggleAuthBtn = document.getElementById('toggle-auth');
        if (toggleAuthBtn) {
            toggleAuthBtn.addEventListener('click', () => this.auth.toggleAuthMode());
        }
        
        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        // Note form
        const noteForm = document.getElementById('note-form');
        if (noteForm) {
            noteForm.addEventListener('submit', (e) => this.handleSaveNote(e));
        }
        
        // Cancel edit
        const cancelEditBtn = document.getElementById('cancel-edit');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => this.cancelEdit());
        }
        
        // Media upload
        const mediaUpload = document.getElementById('media-upload');
        if (mediaUpload) {
            mediaUpload.addEventListener('change', (e) => this.handleMediaSelect(e));
        }
        
        // Media preview removal (delegated)
        const mediaPreview = document.getElementById('media-preview');
        if (mediaPreview) {
            mediaPreview.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-media')) {
                    const index = parseInt(e.target.dataset.index);
                    this.removeSelectedFile(index);
                }
            });
        }
    }
    
    async handleAuth(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value.trim();
        
        const errorDiv = document.getElementById('auth-error');
        const successDiv = document.getElementById('auth-success');
        
        // Clear previous messages
        errorDiv.classList.add('d-none');
        successDiv.classList.add('d-none');
        
        // Validation
        if (!email || !password) {
            this.showAuthError('Email and password are required');
            return;
        }
        
        if (password.length < 6) {
            this.showAuthError('Password must be at least 6 characters');
            return;
        }
        
        try {
            if (this.auth.isSignUp) {
                await this.auth.signUp(email, password, name);
                this.showAuthSuccess('Account created successfully! You can now sign in.');
                
                // Switch to sign in mode
                this.auth.toggleAuthMode();
            } else {
                await this.auth.signIn(email, password);
                // Clear form
                e.target.reset();
            }
        } catch (error) {
            console.error('Auth error:', error);
            this.showAuthError(error.message || 'Authentication failed');
        }
    }
    
    showAuthError(message) {
        const errorDiv = document.getElementById('auth-error');
        errorDiv.textContent = message;
        errorDiv.classList.remove('d-none');
        
        // Scroll to error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    showAuthSuccess(message) {
        const successDiv = document.getElementById('auth-success');
        successDiv.textContent = message;
        successDiv.classList.remove('d-none');
    }
    
    async handleLogout() {
        try {
            await this.auth.signOut();
            this.notesManager = null;
            this.storageManager = null;
            this.currentNoteId = null;
            this.selectedFiles = [];
            
            // Clear notes display
            const notesContainer = document.getElementById('notes-container');
            if (notesContainer) notesContainer.innerHTML = '';
            
            // Reset note form
            this.resetForm();
            
            console.log('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error logging out: ' + error.message);
        }
    }
    
    setupApp() {
        console.log('Setting up app for user:', this.auth.user.id);
        
        this.notesManager = new NotesManager(this.auth.user.id);
        this.storageManager = new StorageManager(this.auth.user.id);
        
        // Show user email
        const userEmailElement = document.getElementById('user-email');
        if (userEmailElement && this.auth.user.email) {
            userEmailElement.textContent = this.auth.user.email;
        }
        
        // Load notes
        this.loadNotes();
    }
    
    async loadNotes() {
        const loadingSpinner = document.getElementById('loading-spinner');
        const notesContainer = document.getElementById('notes-container');
        
        if (loadingSpinner) loadingSpinner.classList.remove('d-none');
        if (notesContainer) notesContainer.innerHTML = '';
        
        try {
            const notes = await this.notesManager.getNotes();
            this.renderNotes(notes);
        } catch (error) {
            console.error('Error loading notes:', error);
            this.showError('Failed to load notes: ' + error.message);
        } finally {
            if (loadingSpinner) loadingSpinner.classList.add('d-none');
        }
    }
    
    renderNotes(notes) {
        const container = document.getElementById('notes-container');
        if (!container) return;
        
        if (!notes || notes.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        <i class="bi bi-journal-text me-2"></i>
                        No notes yet. Create your first note!
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = notes.map(note => `
            <div class="col-md-4 mb-4">
                <div class="card note-card">
                    <div class="card-body">
                        <h5 class="card-title">${this.escapeHtml(note.title)}</h5>
                        <div class="note-content">${this.escapeHtml(note.content)}</div>
                        
                        ${note.media_urls && note.media_urls.length > 0 ? 
                            note.media_urls.map((media, index) => 
                                media.type === 'image' ? 
                                    `<img src="${media.url}" class="note-media" alt="Note image ${index + 1}">` :
                                    `<video controls class="note-media">
                                        <source src="${media.url}" type="${media.type === 'video' ? 'video/mp4' : 'video/*'}">
                                    </video>`
                            ).join('') : ''
                        }
                        
                        <div class="note-actions">
                            <button class="btn btn-sm btn-primary edit-note" data-id="${note.id}">
                                Edit
                            </button>
                            <button class="btn btn-sm btn-danger delete-note" data-id="${note.id}">
                                Delete
                            </button>
                        </div>
                        <small class="text-muted">
                            ${new Date(note.created_at).toLocaleDateString()}
                            ${note.updated_at && note.updated_at !== note.created_at ? 
                                ` • Updated: ${new Date(note.updated_at).toLocaleDateString()}` : ''}
                        </small>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        container.querySelectorAll('.edit-note').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const noteId = e.target.dataset.id;
                const note = notes.find(n => n.id == noteId);
                if (note) this.editNote(note);
            });
        });
        
        container.querySelectorAll('.delete-note').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const noteId = e.target.dataset.id;
                this.deleteNote(noteId);
            });
        });
    }
    
    async editNote(note) {
        this.currentNoteId = note.id;
        
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-content').value = note.content;
        document.getElementById('form-title').textContent = 'Edit Note';
        document.getElementById('save-note').textContent = 'Update Note';
        document.getElementById('cancel-edit').classList.remove('d-none');
        
        // Clear existing previews
        const mediaPreview = document.getElementById('media-preview');
        mediaPreview.innerHTML = '';
        this.selectedFiles = [];
        
        // Show existing media
        if (note.media_urls && note.media_urls.length > 0) {
            note.media_urls.forEach((media, index) => {
                const preview = document.createElement('div');
                preview.className = 'media-preview-item';
                
                if (media.type === 'image') {
                    preview.innerHTML = `
                        <img src="${media.url}" alt="Existing media">
                        <span class="badge-existing">Existing</span>
                    `;
                } else {
                    preview.innerHTML = `
                        <video controls>
                            <source src="${media.url}">
                        </video>
                        <span class="badge-existing">Existing</span>
                    `;
                }
                
                mediaPreview.appendChild(preview);
            });
        }
        
        // Scroll to form
        document.getElementById('note-title').focus();
    }
    
    cancelEdit() {
        this.currentNoteId = null;
        this.resetForm();
        document.getElementById('form-title').textContent = 'Create New Note';
        document.getElementById('save-note').textContent = 'Save Note';
        document.getElementById('cancel-edit').classList.add('d-none');
    }
    
    async handleSaveNote(e) {
        e.preventDefault();
        
        const title = document.getElementById('note-title').value.trim();
        const content = document.getElementById('note-content').value.trim();
        const saveBtn = document.getElementById('save-note');
        
        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }
        
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        try {
            let mediaUrls = [];
            
            // Upload new files if any
            if (this.selectedFiles.length > 0) {
                mediaUrls = await this.storageManager.uploadFiles(this.selectedFiles);
            }
            
            if (this.currentNoteId) {
                // Update existing note
                await this.notesManager.updateNote(this.currentNoteId, title, content, mediaUrls);
            } else {
                // Create new note
                await this.notesManager.createNote(title, content, mediaUrls);
            }
            
            // Reset and reload
            this.resetForm();
            await this.loadNotes();
            
            // Reset edit mode if needed
            if (this.currentNoteId) {
                this.cancelEdit();
            }
            
        } catch (error) {
            console.error('Error saving note:', error);
            this.showError('Error saving note: ' + error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    }
    
    async deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }
        
        try {
            await this.notesManager.deleteNote(noteId);
            await this.loadNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            this.showError('Error deleting note: ' + error.message);
        }
    }
    
    handleMediaSelect(e) {
        const files = Array.from(e.target.files);
        
        // Limit to 5 files
        if (files.length > 5) {
            alert('Maximum 5 files allowed');
            e.target.value = '';
            return;
        }
        
        // Check file sizes (max 5MB each)
        const maxSize = 5 * 1024 * 1024; // 5MB
        const oversizedFiles = files.filter(file => file.size > maxSize);
        
        if (oversizedFiles.length > 0) {
            alert('Each file must be less than 5MB');
            e.target.value = '';
            return;
        }
        
        this.selectedFiles = files;
        this.storageManager.previewFiles(files, 'media-preview');
    }
    
    removeSelectedFile(index) {
        this.selectedFiles.splice(index, 1);
        
        // Update file input
        const dataTransfer = new DataTransfer();
        this.selectedFiles.forEach(file => dataTransfer.items.add(file));
        document.getElementById('media-upload').files = dataTransfer.files;
        
        // Update preview
        this.storageManager.previewFiles(this.selectedFiles, 'media-preview');
    }
    
    resetForm() {
        const noteForm = document.getElementById('note-form');
        if (noteForm) noteForm.reset();
        
        const mediaPreview = document.getElementById('media-preview');
        if (mediaPreview) mediaPreview.innerHTML = '';
        
        this.selectedFiles = [];
    }
    
    showError(message) {
        // You can implement a toast or alert system here
        console.error('App error:', message);
        alert(message);
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting app...');
    
    // Give Supabase a moment to load
    setTimeout(() => {
        window.app = new NotesApp();
        
        // Listen for auth state changes
        if (window.supabase) {
            window.supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state change:', event);
                
                if (session?.user && window.app && window.app.auth) {
                    // Setup app if not already done
                    if (!window.app.notesManager) {
                        window.app.setupApp();
                    }
                }
            });
        }
    }, 100);
});
