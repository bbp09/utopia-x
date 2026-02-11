// ===================================
// 🎭 UTOPIA X - Artist Profile Editor
// ===================================

console.log('🎭 Artist Profile Editor Loading...');

// Global state
let currentUser = null;
let selectedPhotos = []; // Array of {file: File, preview: URL, index: number}
let selectedTags = [];
const MAX_PHOTOS = 5;
const MAX_TAGS = 5;

// ===================================
// 🔐 Authentication Check
// ===================================
async function checkAuth() {
    console.log('🔐 Checking authentication (prototype mode)...');
    
    /* 프로토타입 모드: 로그인 체크 비활성화
    if (!window.supabase) {
        console.error('❌ Supabase not initialized!');
        alert('시스템 오류가 발생했습니다.');
        window.location.replace('/');
        return false;
    }

    const { data: { user }, error } = await window.supabase.auth.getUser();
    
    if (error || !user) {
        console.error('❌ Not authenticated:', error);
        alert('로그인이 필요합니다.');
        window.location.replace('/');
        return false;
    }

    // Get user role
    const { data: userData } = await window.supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (userData?.role !== 'dancer') {
        console.error('❌ Not an artist!');
        alert('댄서 계정만 접근 가능합니다.');
        window.location.replace('/client-dashboard.html');
        return false;
    }

    currentUser = user;
    console.log('✅ Artist authenticated:', user.id);
    return true;
    */
    
    // 프로토타입용 가짜 사용자
    currentUser = {
        id: 'prototype-artist-001',
        email: 'artist@utopia-x.com'
    };
    console.log('✅ Prototype artist set:', currentUser);
    return true;
}

// ===================================
// 📸 Photo Upload Grid Initialization
// ===================================
function initPhotoGrid() {
    console.log('📸 Initializing photo grid...');
    const grid = document.getElementById('photoUploadGrid');
    
    for (let i = 0; i < MAX_PHOTOS; i++) {
        const slot = document.createElement('div');
        slot.className = 'photo-slot';
        slot.dataset.index = i;
        
        slot.innerHTML = `
            <input type="file" 
                   id="photoInput${i}" 
                   accept="image/*" 
                   style="display: none;">
            <div class="photo-preview" id="photoPreview${i}">
                <i class="fas fa-plus"></i>
                <span>사진 추가</span>
            </div>
            <button type="button" 
                    class="btn-remove-photo" 
                    id="btnRemove${i}" 
                    style="display: none;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        grid.appendChild(slot);
        
        // Bind events
        const input = document.getElementById(`photoInput${i}`);
        const preview = document.getElementById(`photoPreview${i}`);
        const btnRemove = document.getElementById(`btnRemove${i}`);
        
        // Click to upload
        preview.addEventListener('click', () => input.click());
        
        // Handle file selection
        input.addEventListener('change', (e) => handlePhotoSelect(e, i));
        
        // Handle remove
        btnRemove.addEventListener('click', () => removePhoto(i));
    }
    
    console.log('✅ Photo grid initialized');
}

// ===================================
// 📷 Handle Photo Selection
// ===================================
function handlePhotoSelect(event, index) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById(`photoPreview${index}`);
        const btnRemove = document.getElementById(`btnRemove${index}`);
        
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        preview.classList.add('has-image');
        btnRemove.style.display = 'block';
        
        // Store in state
        selectedPhotos[index] = {
            file: file,
            preview: e.target.result,
            index: index
        };
        
        console.log(`✅ Photo ${index + 1} selected:`, file.name);
    };
    
    reader.readAsDataURL(file);
}

// ===================================
// 🗑️ Remove Photo
// ===================================
function removePhoto(index) {
    const preview = document.getElementById(`photoPreview${index}`);
    const btnRemove = document.getElementById(`btnRemove${index}`);
    const input = document.getElementById(`photoInput${index}`);
    
    preview.innerHTML = `
        <i class="fas fa-plus"></i>
        <span>사진 추가</span>
    `;
    preview.classList.remove('has-image');
    btnRemove.style.display = 'none';
    input.value = '';
    
    selectedPhotos[index] = null;
    console.log(`🗑️ Photo ${index + 1} removed`);
}

// ===================================
// 🏷️ Vibe Tags Initialization
// ===================================
function initVibeTagsSelection() {
    console.log('🏷️ Initializing vibe tags...');
    
    const tagsContainer = document.getElementById('vibeTagsSelection');
    const chips = tagsContainer.querySelectorAll('.tag-chip');
    
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const tag = chip.dataset.tag;
            
            if (chip.classList.contains('selected')) {
                // Deselect
                chip.classList.remove('selected');
                selectedTags = selectedTags.filter(t => t !== tag);
                console.log(`❌ Tag removed: ${tag}`);
            } else {
                // Select (max 5)
                if (selectedTags.length >= MAX_TAGS) {
                    alert(`최대 ${MAX_TAGS}개까지만 선택 가능합니다.`);
                    return;
                }
                chip.classList.add('selected');
                selectedTags.push(tag);
                console.log(`✅ Tag selected: ${tag}`);
            }
            
            console.log('Current tags:', selectedTags);
        });
    });
    
    console.log('✅ Vibe tags initialized');
}

// ===================================
// 📥 Load Existing Profile Data
// ===================================
async function loadProfileData() {
    console.log('📥 Loading profile data...');
    
    try {
        // Query dancers table
        const { data, error } = await window.supabase
            .from('dancers')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                console.log('ℹ️ No profile found, creating new profile...');
                return; // New profile
            }
            throw error;
        }
        
        console.log('✅ Profile data loaded:', data);
        
        // Fill form
        document.getElementById('stageName').value = data.stage_name || '';
        document.getElementById('phone').value = data.phone || '';
        document.getElementById('region').value = data.region || '';
        document.getElementById('clothingSize').value = data.clothing_size || '';
        document.getElementById('shoeSize').value = data.shoe_size || '';
        document.getElementById('mainGenre').value = data.main_genre || '';
        document.getElementById('subGenre').value = data.sub_genre || '';
        
        // Load photos
        if (data.photos && Array.isArray(data.photos)) {
            data.photos.forEach((url, index) => {
                if (index < MAX_PHOTOS && url) {
                    loadExistingPhoto(url, index);
                }
            });
        }
        
        // Load tags
        if (data.vibe_tags && Array.isArray(data.vibe_tags)) {
            selectedTags = [...data.vibe_tags];
            selectedTags.forEach(tag => {
                const chip = document.querySelector(`.tag-chip[data-tag="${tag}"]`);
                if (chip) chip.classList.add('selected');
            });
        }
        
        console.log('✅ Profile data populated');
        
    } catch (error) {
        console.error('❌ Error loading profile:', error);
        showToast('프로필 로딩 중 오류가 발생했습니다.', 'error');
    }
}

// ===================================
// 🖼️ Load Existing Photo from URL
// ===================================
function loadExistingPhoto(url, index) {
    const preview = document.getElementById(`photoPreview${index}`);
    const btnRemove = document.getElementById(`btnRemove${index}`);
    
    preview.innerHTML = `<img src="${url}" alt="Profile Photo ${index + 1}">`;
    preview.classList.add('has-image');
    btnRemove.style.display = 'block';
    
    // Mark as existing (not new upload)
    selectedPhotos[index] = {
        url: url,
        existing: true,
        index: index
    };
    
    console.log(`🖼️ Existing photo ${index + 1} loaded`);
}

// ===================================
// 💾 Form Submission
// ===================================
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('💾 Submitting profile...');
    
    // Show loading
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    try {
        // 1. Collect form data
        const formData = {
            stage_name: document.getElementById('stageName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            region: document.getElementById('region').value,
            clothing_size: document.getElementById('clothingSize').value,
            shoe_size: document.getElementById('shoeSize').value,
            main_genre: document.getElementById('mainGenre').value,
            sub_genre: document.getElementById('subGenre').value,
            vibe_tags: selectedTags
        };
        
        // Validate required fields
        if (!formData.stage_name || !formData.phone || !formData.region || !formData.main_genre) {
            throw new Error('필수 항목을 모두 입력해주세요.');
        }
        
        console.log('📝 Form data:', formData);
        
        // 2. Upload new photos to Supabase Storage
        const photoUrls = [];
        
        for (let i = 0; i < MAX_PHOTOS; i++) {
            const photo = selectedPhotos[i];
            
            if (!photo) {
                photoUrls.push(null);
                continue;
            }
            
            if (photo.existing) {
                // Keep existing URL
                photoUrls.push(photo.url);
                console.log(`✅ Keeping existing photo ${i + 1}`);
            } else {
                // Upload new photo
                console.log(`📤 Uploading photo ${i + 1}...`);
                const fileName = `${currentUser.id}_${Date.now()}_${i}.jpg`;
                const filePath = `dancers/${fileName}`;
                
                const { data: uploadData, error: uploadError } = await window.supabase.storage
                    .from('profile-photos')
                    .upload(filePath, photo.file, {
                        cacheControl: '3600',
                        upsert: false
                    });
                
                if (uploadError) {
                    console.error('❌ Upload error:', uploadError);
                    throw uploadError;
                }
                
                // Get public URL
                const { data: urlData } = window.supabase.storage
                    .from('profile-photos')
                    .getPublicUrl(filePath);
                
                photoUrls.push(urlData.publicUrl);
                console.log(`✅ Photo ${i + 1} uploaded:`, urlData.publicUrl);
            }
        }
        
        formData.photos = photoUrls.filter(url => url !== null);
        console.log('📸 Final photo URLs:', formData.photos);
        
        // 3. Save to database (upsert)
        const { data: savedData, error: dbError } = await window.supabase
            .from('dancers')
            .upsert({
                user_id: currentUser.id,
                ...formData,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();
        
        if (dbError) {
            console.error('❌ Database error:', dbError);
            throw dbError;
        }
        
        console.log('✅ Profile saved:', savedData);
        
        // Success!
        showToast('프로필이 저장되었습니다!', 'success');
        
        // Reload data after delay
        setTimeout(() => {
            loadProfileData();
        }, 1500);
        
    } catch (error) {
        console.error('❌ Error saving profile:', error);
        showToast(error.message || '저장 중 오류가 발생했습니다.', 'error');
    } finally {
        // Hide loading
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}

// ===================================
// 🍞 Toast Notification
// ===================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };
    
    toast.style.cssText = `
        background: ${colors[type]};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===================================
// 🎬 Initialize on Page Load
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎬 Artist Profile Page Loaded');
    
    // 1. Check authentication
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;
    
    // 2. Initialize UI
    initPhotoGrid();
    initVibeTagsSelection();
    
    // 3. Load existing data
    await loadProfileData();
    
    // 4. Bind form submit
    document.getElementById('artistProfileForm').addEventListener('submit', handleFormSubmit);
    
    console.log('✅ Artist Profile Editor Ready!');
});

// Add animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .photo-slot {
        position: relative;
        aspect-ratio: 1;
        border: 2px dashed rgba(139, 92, 246, 0.5);
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .photo-slot:hover {
        border-color: rgba(139, 92, 246, 1);
        transform: scale(1.02);
    }
    
    .photo-preview {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.05);
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .photo-preview:hover {
        background: rgba(139, 92, 246, 0.1);
    }
    
    .photo-preview i {
        font-size: 32px;
        color: rgba(139, 92, 246, 0.5);
        margin-bottom: 8px;
    }
    
    .photo-preview span {
        font-size: 14px;
        color: #666;
    }
    
    .photo-preview.has-image {
        background: none;
        cursor: default;
    }
    
    .photo-preview.has-image:hover {
        background: none;
    }
    
    .photo-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .btn-remove-photo {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: all 0.3s ease;
    }
    
    .btn-remove-photo:hover {
        background: rgba(239, 68, 68, 1);
        transform: scale(1.1);
    }
    
    .photo-upload-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
        margin-top: 16px;
    }
    
    .tags-selection {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 16px;
    }
    
    .tag-chip {
        padding: 10px 20px;
        border: 2px solid rgba(139, 92, 246, 0.3);
        border-radius: 25px;
        background: rgba(139, 92, 246, 0.05);
        color: #8b5cf6;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
    }
    
    .tag-chip:hover {
        border-color: rgba(139, 92, 246, 0.6);
        background: rgba(139, 92, 246, 0.1);
        transform: translateY(-2px);
    }
    
    .tag-chip.selected {
        border-color: #8b5cf6;
        background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
    }
`;
document.head.appendChild(style);

console.log('✅ Artist Profile JS Loaded');
