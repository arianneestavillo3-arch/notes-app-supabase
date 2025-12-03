class StorageManager {
   constructor(userId) {
       this.userId = userId;
       this.bucketName = 'notes-media';
       console.log('StorageManager initialized for user:', userId);
   }
   
   async uploadFiles(files) {
       console.log('Uploading', files.length, 'files');
       
       if (!this.userId) {
           throw new Error('User not authenticated');
       }
       
       const uploadedUrls = [];
       
       for (const file of files) {
           const fileExt = file.name.split('.').pop();
           const fileName = `${this.userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
           const filePath = fileName;
           
           console.log('Uploading file:', file.name, 'to path:', filePath);
           
           // Check file size (5MB limit)
           const maxSize = 5 * 1024 * 1024; // 5MB
           if (file.size > maxSize) {
               throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`);
           }
           
           // Check file type
           if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
               throw new Error(`File ${file.name} is not an image or video.`);
           }
           
           const { data, error } = await window.supabase.storage
               .from(this.bucketName)
               .upload(filePath, file, {
                   cacheControl: '3600',
                   upsert: false
               });
           
           if (error) {
               console.error('Upload error for', file.name, ':', error);
               throw new Error(`Failed to upload ${file.name}: ${error.message}`);
           }
           
           // Get public URL
           const { data: { publicUrl } } = window.supabase.storage
               .from(this.bucketName)
               .getPublicUrl(filePath);
           
           uploadedUrls.push({
               url: publicUrl,
               type: file.type.startsWith('image/') ? 'image' : 'video',
               name: file.name,
               path: filePath
           });
           
           console.log('File uploaded successfully:', publicUrl);
       }
       
       return uploadedUrls;
   }
   
   async deleteFile(filePath) {
       try {
           const { error } = await window.supabase.storage
               .from(this.bucketName)
               .remove([filePath]);
           
           if (error) {
               console.error('Delete file error:', error);
               throw error;
           }
           
           console.log('File deleted successfully:', filePath);
       } catch (error) {
           console.error('Error deleting file:', error);
           throw error;
       }
   }
   
   previewFiles(files, containerId) {
       const container = document.getElementById(containerId);
       if (!container) {
           console.error('Container not found:', containerId);
           return;
       }
       
       container.innerHTML = '';
       
       Array.from(files).forEach((file, index) => {
           const reader = new FileReader();
           reader.onload = (e) => {
               const preview = document.createElement('div');
               preview.className = 'media-preview-item';
               
               if (file.type.startsWith('image/')) {
                   preview.innerHTML = `
                       <img src="${e.target.result}" alt="Preview">
                       <button type="button" class="remove-media" data-index="${index}">×</button>
                   `;
               } else if (file.type.startsWith('video/')) {
                   preview.innerHTML = `
                       <video>
                           <source src="${e.target.result}" type="${file.type}">
                       </video>
                       <button type="button" class="remove-media" data-index="${index}">×</button>
                   `;
               } else {
                   preview.innerHTML = `
                       <div class="file-preview">
                           <span>${file.name}</span>
                           <button type="button" class="remove-media" data-index="${index}">×</button>
                       </div>
                   `;
               }
               
               container.appendChild(preview);
           };
           reader.readAsDataURL(file);
       });
   }
}

window.StorageManager = StorageManager;