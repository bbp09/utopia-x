// =====================================
//  UTOPIA X - Artist Profile Management
//  아티스트 프로필 수정 페이지
// =====================================

let currentUser = null;
let selectedPhotos = [];
let selectedTags = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📝 Initializing Artist Profile Page...');
    
    // Check authentication
    await checkAuth();
    
    // Initialize photo upload grid
    initPhotoUploadGrid();
    
    // Load user data
    await loadArtistData();
    
    // Bind events
    bindEvents();
    
    console.log('✅ Artist Profile Page initialized');
});

// Check authentication
async function checkAuth() {
    console.log('🔐 Checking authentication...');
    
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase not available');
        alert('데이터베이스 연결에 실패했습니다');
        window.location.replace('index.html');
        return;
    }
    
    try {
        const { data: { user }, error } = await window.supabase.auth.getUser();
        
        if (error || !user) {
            console.error('❌ Not logged in:', error);
            alert('로그인이 필요합니다');
            window.location.replace('index.html');
            return;
        }
        
        currentUser = user;
        console.log('✅ User authenticated:', user.id);
        
    } catch (error) {
        console.error('❌ Auth check failed:', error);
        window.location.replace('index.html');
    }
}

// Initialize photo upload grid
function initPhotoUploadGrid() {
    const grid = document.getElementById('photoUploadGrid');
    
    for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'photo-slot';
        slot.innerHTML = `
            <input type="file" id="photoInput${i}" accept="image/*" style="display: none;">
            <div class="photo-preview" id="photoPreview${i}">
                <i class="fas fa-camera"></i>
                <p>사진 업로드</p>
            </div>
            <button type="button" class="btn-remove-photo" id="removePhoto${i}" style="display: none;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        grid.appendChild(slot);
        
        // Bind upload event
        const input = slot.querySelector(`#photoInput${i}`);
        const preview = slot.querySelector(`#photoPreview${i}`);
        const removeBtn = slot.querySelector(`#removePhoto${i}`);
        
        preview.addEventListener('click', () => input.click());
        
        input.addEventListener('change', (e) => handlePhotoUpload(e, i));
        removeBtn.addEventListener('click', () => removePhoto(i));
    }
}

// Handle photo upload
async function handlePhotoUpload(e, index) {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('📤 Uploading photo:', file.name);
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        showToast('이미지 파일만 업로드 가능합니다', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('파일 크기는 5MB 이하여야 합니다', 'error');
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById(`photoPreview${index}`);
        const removeBtn = document.getElementById(`removePhoto${index}`);
        
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        removeBtn.style.display = 'block';
        
        selectedPhotos[index] = file;
    };
    reader.readAsDataURL(file);
}

// Remove photo
function removePhoto(index) {
    const preview = document.getElementById(`photoPreview${index}`);
    const removeBtn = document.getElementById(`removePhoto${index}`);
    const input = document.getElementById(`photoInput${index}`);
    
    preview.innerHTML = `
        <i class="fas fa-camera"></i>
        <p>사진 업로드</p>
    `;
    removeBtn.style.display = 'none';
    input.value = '';
    selectedPhotos[index] = null;
}

// Load artist data from Supabase
async function loadArtistData() {
    console.log('📦 Loading artist data...');
    
    if (!currentUser) return;
    
    try {
        // Load from dancers table
        const { data: dancerData, error } = await window.supabase
            .from('dancers')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('❌ Failed to load dancer data:', error);
            return;
        }
        
        if (dancerData) {
            console.log('✅ Dancer data loaded:', dancerData);
            
            // Fill form fields
            document.getElementById('stageName').value = dancerData.stage_name || '';
            document.getElementById('phone').value = dancerData.phone || '';
            document.getElementById('region').value = dancerData.region || '';
            document.getElementById('clothingSize').value = dancerData.clothing_size || '';
            document.getElementById('shoeSize').value = dancerData.shoe_size || '';
            document.getElementById('mainGenre').value = dancerData.main_genre || '';
            document.getElementById('subGenre').value = dancerData.sub_genre || '';
            
            // Load photos
            if (dancerData.photos && Array.isArray(dancerData.photos)) {
                dancerData.photos.forEach((photoUrl, index) => {
                    if (index < 5 && photoUrl) {
                        const preview = document.getElementById(`photoPreview${index}`);
                        const removeBtn = document.getElementById(`removePhoto${index}`);
                        
                        preview.innerHTML = `<img src="${photoUrl}" alt="Photo ${index + 1}">`;
                        removeBtn.style.display = 'block';
                    }
                });
            }
            
            // Load tags
            if (dancerData.vibe_tags && Array.isArray(dancerData.vibe_tags)) {
                selectedTags = dancerData.vibe_tags;
                dancerData.vibe_tags.forEach(tag => {
                    const chip = document.querySelector(`.tag-chip[data-tag="${tag}"]`);
                    if (chip) chip.classList.add('active');
                });
            }
        } else {
            console.log('ℹ️ No dancer data found (new artist)');
        }
        
    } catch (error) {
        console.error('❌ Exception loading artist data:', error);
        showToast('데이터를 불러오는데 실패했습니다', 'error');
    }
}

// Bind events
function bindEvents() {
    // Tag selection
    const tagChips = document.querySelectorAll('.tag-chip');
    tagChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const tag = chip.dataset.tag;
            
            if (chip.classList.contains('active')) {
                chip.classList.remove('active');
                selectedTags = selectedTags.filter(t => t !== tag);
            } else {
                if (selectedTags.length >= 5) {
                    showToast('최대 5개까지 선택 가능합니다', 'warning');
                    return;
                }
                chip.classList.add('active');
                selectedTags.push(tag);
            }
        });
    });
    
    // Form submit
    document.getElementById('artistProfileForm').addEventListener('submit', handleSubmit);
}

// Handle form submit
async function handleSubmit(e) {
    e.preventDefault();
    console.log('💾 Saving profile...');
    
    const submitBtn = document.getElementById('submitBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';
    loadingOverlay.style.display = 'flex';
    
    try {
        // Get form data
        const stageName = document.getElementById('stageName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const region = document.getElementById('region').value;
        const clothingSize = document.getElementById('clothingSize').value;
        const shoeSize = document.getElementById('shoeSize').value;
        const mainGenre = document.getElementById('mainGenre').value;
        const subGenre = document.getElementById('subGenre').value;
        
        // Upload photos
        const photoUrls = [];
        for (let i = 0; i < 5; i++) {
            const file = selectedPhotos[i];
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${currentUser.id}_photo${i + 1}_${Date.now()}.${fileExt}`;
                const filePath = `dancer_photos/${fileName}`;
                
                const { data: uploadData, error: uploadError } = await window.supabase.storage
                    .from('assets')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });
                
                if (uploadError) {
                    console.error('❌ Photo upload failed:', uploadError);
                } else {
                    const { data: urlData } = window.supabase.storage
                        .from('assets')
                        .getPublicUrl(filePath);
                    
                    photoUrls[i] = urlData.publicUrl;
                    console.log('✅ Photo uploaded:', photoUrls[i]);
                }
            } else {
                // Keep existing photo if not changed
                const preview = document.getElementById(`photoPreview${i}`);
                const img = preview.querySelector('img');
                if (img) {
                    photoUrls[i] = img.src;
                }
            }
        }
        
        // Upsert dancers table
        const { error: dancerError } = await window.supabase
            .from('dancers')
            .upsert({
                user_id: currentUser.id,
                stage_name: stageName,
                phone: phone,
                region: region,
                clothing_size: clothingSize,
                shoe_size: shoeSize,
                main_genre: mainGenre,
                sub_genre: subGenre,
                vibe_tags: selectedTags,
                photos: photoUrls.filter(url => url)
            }, {
                onConflict: 'user_id'
            });
        
        if (dancerError) {
            console.error('❌ Failed to update dancer:', dancerError);
            showToast('프로필 저장에 실패했습니다', 'error');
            return;
        }
        
        console.log('✅ Dancer data updated');
        
        // Show success
        showToast('프로필이 성공적으로 저장되었습니다! 🎉', 'success');
        
        // Reload data
        setTimeout(async () => {
            await loadArtistData();
        }, 1500);
        
    } catch (error) {
        console.error('❌ Exception saving profile:', error);
        showToast('저장 중 오류가 발생했습니다', 'error');
    } finally {
        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> 저장하기';
        loadingOverlay.style.display = 'none';
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    toast.style.cssText = `
        background: white;
        border-left: 4px solid ${colors[type]};
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}" style="color: ${colors[type]}; font-size: 20px;"></i>
        <span style="color: #1a1a1a; font-weight: 500;">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
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
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .photo-slot {
        position: relative;
        width: 100%;
        padding-bottom: 100%;
        background: #f9fafb;
        border: 2px dashed #e5e7eb;
        border-radius: 15px;
        overflow: hidden;
    }
    
    .photo-preview {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .photo-preview:hover {
        background: rgba(157, 78, 221, 0.05);
        border-color: #9d4edd;
    }
    
    .photo-preview i {
        font-size: 48px;
        color: #9ca3af;
        margin-bottom: 10px;
    }
    
    .photo-preview p {
        font-size: 14px;
        color: #6b7280;
    }
    
    .photo-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .btn-remove-photo {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(239, 68, 68, 0.9);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        z-index: 10;
    }
    
    .btn-remove-photo:hover {
        background: #dc2626;
        transform: scale(1.1);
    }
    
    .photo-upload-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 20px;
    }
    
    .tag-chip.active {
        background: linear-gradient(135deg, #9d4edd, #e91e84);
        color: white;
        border-color: transparent;
    }
`;
document.head.appendChild(style);

console.log('✅ Artist Profile JS loaded');
