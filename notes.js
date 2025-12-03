class NotesManager {
    constructor(userId) {
        this.userId = userId;
        console.log('NotesManager initialized for user:', userId);
    }
    
    async createNote(title, content, mediaUrls = []) {
        console.log('Creating note:', title);
        
        const { data, error } = await window.supabase
            .from('notes')
            .insert([{
                user_id: this.userId,
                title,
                content,
                media_urls: mediaUrls,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select();
        
        if (error) {
            console.error('Create note error:', error);
            throw error;
        }
        
        console.log('Note created successfully:', data[0]);
        return data[0];
    }
    
    async getNotes() {
        console.log('Fetching notes for user:', this.userId);
        
        const { data, error } = await window.supabase
            .from('notes')
            .select('*')
            .eq('user_id', this.userId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Get notes error:', error);
            throw error;
        }
        
        console.log('Fetched', data?.length || 0, 'notes');
        return data || [];
    }
    
    async updateNote(id, title, content, mediaUrls) {
        console.log('Updating note:', id);
        
        const { data, error } = await window.supabase
            .from('notes')
            .update({
                title,
                content,
                media_urls: mediaUrls,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', this.userId)
            .select();
        
        if (error) {
            console.error('Update note error:', error);
            throw error;
        }
        
        console.log('Note updated successfully');
        return data[0];
    }
    
    async deleteNote(id) {
        console.log('Deleting note:', id);
        
        const { error } = await window.supabase
            .from('notes')
            .delete()
            .eq('id', id)
            .eq('user_id', this.userId);
        
        if (error) {
            console.error('Delete note error:', error);
            throw error;
        }
        
        console.log('Note deleted successfully');
    }
    
    async getNoteById(id) {
        const { data, error } = await window.supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .eq('user_id', this.userId)
            .single();
        
        if (error) {
            console.error('Get note by ID error:', error);
            throw error;
        }
        
        return data;
    }
}

window.NotesManager = NotesManager;