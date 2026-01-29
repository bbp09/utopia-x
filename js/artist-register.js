// ===================================
//  Artist Register Page Logic
// ===================================

console.log('🎭 Artist Register page loaded');

// Global state
const state = {
    selectedTags: [],
    maxTags: 5,
    selectedImages: [],
    maxImages: 5,
    userRole: null,
    userId: null,
    userEmail: null
};

// ===== Check Authentication =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM ready, checking authentication...');
    
    // Check if user is logged in
    state.userEmail = sessionStorage.getItem('userEmail');
    state.userRole = sessionStorage.getItem('userRole');
    
    console.log('👤 User email:', state.userEmail);
    console.log('🎭 User role:', state.userRole);
    
    if (!state.userEmail) {
        console.error('❌ User not logged in');
        showToast('로그인이 필요합니다', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    if (state.userRole !== 'artist') {
        console.error('❌ User is not an artist:', state.userRole);
        showToast('아티스트만 접근 가능한 페이지입니다', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    console.log('✅ Auth check passed');
    
    // Get user ID from Supabase
    getUserId();
    
    // Pre-fill phone number if available
    const userPhone = sessionStorage.getItem('userPhone');
    if (userPhone) {
        document.getElementById('phone').value = userPhone;
    }
    
    // Initialize event listeners
    initTagSelection();
    initImageUpload();
    initFormSubmit();
});

// ===== Get User ID from Supabase =====
async function getUserId() {
    console.log('🔍 Getting user ID from Supabase...');
    
    if (!window.supabase) {
        console.error('❌ Supabase client not available');
        return;
    }
    
    try {
        const { data: { user }, error } = await window.supabase.auth.getUser();
        
        if (error) {
            console.error('❌ Failed to get user:', error);
            return;
        }
        
        if (user) {
            state.userId = user.id;
            console.log('✅ User ID:', state.userId);
        } else {
            console.error('❌ No user found');
        }
    } catch (err) {
        console.error('❌ Exception getting user:', err);
    }
}

// ===== Tag Selection Logic =====
function initTagSelection() {
    console.log('🏷️ Initializing tag selection...');
    
    const tagChips = document.querySelectorAll('.tag-chip');
    const tagCount = document.getElementById('tagCount');
    
    tagChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const tag = chip.getAttribute('data-tag');
            
            if (chip.classList.contains('selected')) {
                // Deselect
                chip.classList.remove('selected');
                state.selectedTags = state.selectedTags.filter(t => t !== tag);
                console.log('➖ Tag removed:', tag);
            } else {
                // Select (if not at max)
                if (state.selectedTags.length >= state.maxTags) {
                    showToast(`최대 ${state.maxTags}개까지만 선택 가능합니다`, 'warning');
                    return;
                }
                
                chip.classList.add('selected');
                state.selectedTags.push(tag);
                console.log('➕ Tag added:', tag);
            }
            
            // Update count
            tagCount.textContent = `선택된 태그: ${state.selectedTags.length} / ${state.maxTags}`;
            console.log('📋 Selected tags:', state.selectedTags);
        });
    });
    
    console.log('✅ Tag selection initialized');
}

// ===== Image Upload Logic =====
function initImageUpload() {
    console.log('📸 Initializing image upload...');
    
    const fileInput = document.getElementById('profileImages');
    const previewGrid = document.getElementById('imagePreviewGrid');
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        console.log('📁 Files selected:', files.length);
        
        // Check max images
        const remainingSlots = state.maxImages - state.selectedImages.length;
        if (files.length > remainingSlots) {
            showToast(`최대 ${state.maxImages}장까지만 업로드 가능합니다 (${remainingSlots}장 남음)`, 'warning');
            return;
        }
        
        // Process files
        files.forEach((file, index) => {
            // Check file type
            if (!file.type.startsWith('image/')) {
                showToast('이미지 파일만 업로드 가능합니다', 'error');
                return;
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast('파일 크기는 5MB 이하여야 합니다', 'error');
                return;
            }
            
            // Read file
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    file: file,
                    dataUrl: e.target.result,
                    isMain: state.selectedImages.length === 0 // First image is main
                };
                
                state.selectedImages.push(imageData);
                console.log('✅ Image added:', file.name, '(Main:', imageData.isMain, ')');
                
                renderImagePreviews();
            };
            reader.readAsDataURL(file);
        });
        
        // Reset file input
        fileInput.value = '';
    });
    
    console.log('✅ Image upload initialized');
}

// ===== Render Image Previews =====
function renderImagePreviews() {
    const previewGrid = document.getElementById('imagePreviewGrid');
    
    previewGrid.innerHTML = state.selectedImages.map((img, index) => `
        <div class="image-preview-item">
            <img src="${img.dataUrl}" alt="Preview ${index + 1}">
            ${img.isMain ? '<div class="main-badge">대표 사진</div>' : ''}
            <button type="button" class="remove-image" onclick="removeImage(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    console.log('🖼️ Rendered', state.selectedImages.length, 'image previews');
}

// ===== Remove Image =====
window.removeImage = function(index) {
    console.log('🗑️ Removing image at index:', index);
    
    state.selectedImages.splice(index, 1);
    
    // Re-assign main image if first was removed
    if (state.selectedImages.length > 0) {
        state.selectedImages[0].isMain = true;
    }
    
    renderImagePreviews();
};

// ===== Form Submit Logic =====
function initFormSubmit() {
    console.log('📝 Initializing form submit...');
    
    const form = document.getElementById('artistRegisterForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('🚀 Form submitted');
        
        // Show loading
        showLoading(true);
        
        try {
            // 1️⃣ Collect form data
            const formData = collectFormData();
            console.log('📋 Form data collected:', formData);
            
            // 2️⃣ Validate data
            if (!validateFormData(formData)) {
                showLoading(false);
                return;
            }
            
            // 3️⃣ Upload images (if any)
            let imageUrls = [];
            if (state.selectedImages.length > 0) {
                console.log('📤 Uploading', state.selectedImages.length, 'images...');
                imageUrls = await uploadImages();
                
                if (!imageUrls || imageUrls.length === 0) {
                    showLoading(false);
                    showToast('이미지 업로드에 실패했습니다', 'error');
                    return;
                }
                
                console.log('✅ Images uploaded:', imageUrls);
            } else {
                // Use placeholder image
                imageUrls = [`https://images.unsplash.com/photo-${Date.now()}?w=400&h=400&fit=crop`];
                console.log('📸 Using placeholder image');
            }
            
            // 4️⃣ Prepare dancer record
            const dancerRecord = {
                user_id: state.userId,
                name: formData.stageName,
                genre: formData.mainGenre + (formData.subGenre ? ', ' + formData.subGenre : ''),
                image_url: imageUrls[0], // Main profile image
                profile_images: imageUrls, // All images
                phone: formData.phone,
                region: formData.region,
                height: formData.height,
                weight: formData.weight,
                clothing_size: formData.clothingSize,
                shoe_size: formData.shoeSize,
                instagram_url: formData.instagramUrl || null,
                tiktok_url: formData.tiktokUrl || null,
                youtube_url: formData.youtubeUrl || null,
                vibe_tags: state.selectedTags,
                skills: formData.skills,
                status: 'pending', // 🚨 Critical: Set to pending for admin approval
                is_premium: false,
                rating: 0,
                bio: `${formData.stageName} - ${formData.mainGenre} 댄서`
            };
            
            console.log('📤 Dancer record to insert:', dancerRecord);
            
            // 5️⃣ Insert into Supabase
            const { data, error } = await window.supabase
                .from('dancers')
                .insert([dancerRecord])
                .select();
            
            if (error) {
                console.error('❌ Insert error:', error);
                showLoading(false);
                showToast('등록 실패: ' + error.message, 'error');
                return;
            }
            
            console.log('✅ Dancer registered:', data);
            
            // 6️⃣ Success
            showLoading(false);
            showToast('🎉 프로필 등록이 완료되었습니다!\n관리자 승인 후 활동 가능합니다.', 'success');
            
            // Redirect after 3 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
            
        } catch (err) {
            console.error('❌ Form submit exception:', err);
            showLoading(false);
            showToast('등록 중 오류가 발생했습니다', 'error');
        }
    });
    
    console.log('✅ Form submit initialized');
}

// ===== Collect Form Data =====
function collectFormData() {
    // Get all skills
    const skills = [];
    document.querySelectorAll('.skill-checkbox input:checked').forEach(checkbox => {
        skills.push(checkbox.value);
    });
    
    return {
        stageName: document.getElementById('stageName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        region: document.getElementById('region').value,
        mainGenre: document.getElementById('mainGenre').value,
        subGenre: document.getElementById('subGenre').value,
        height: parseInt(document.getElementById('height').value),
        weight: parseInt(document.getElementById('weight').value),
        clothingSize: document.getElementById('clothingSize').value,
        shoeSize: document.getElementById('shoeSize').value,
        instagramUrl: document.getElementById('instagramUrl').value.trim(),
        tiktokUrl: document.getElementById('tiktokUrl').value.trim(),
        youtubeUrl: document.getElementById('youtubeUrl').value.trim(),
        skills: skills
    };
}

// ===== Validate Form Data =====
function validateFormData(data) {
    console.log('✅ Validating form data...');
    
    // Check required fields
    if (!data.stageName) {
        showToast('활동명을 입력해주세요', 'error');
        return false;
    }
    
    if (!data.phone || data.phone.length < 10) {
        showToast('올바른 연락처를 입력해주세요', 'error');
        return false;
    }
    
    if (!data.region) {
        showToast('활동 지역을 선택해주세요', 'error');
        return false;
    }
    
    if (!data.mainGenre) {
        showToast('Main 장르를 선택해주세요', 'error');
        return false;
    }
    
    if (!data.height || data.height < 140 || data.height > 210) {
        showToast('올바른 신장을 입력해주세요 (140-210cm)', 'error');
        return false;
    }
    
    if (!data.weight || data.weight < 30 || data.weight > 150) {
        showToast('올바른 체중을 입력해주세요 (30-150kg)', 'error');
        return false;
    }
    
    if (!data.clothingSize) {
        showToast('의상 사이즈를 선택해주세요', 'error');
        return false;
    }
    
    if (!data.shoeSize) {
        showToast('신발 사이즈를 선택해주세요', 'error');
        return false;
    }
    
    // Check vibe tags (at least 1)
    if (state.selectedTags.length === 0) {
        showToast('최소 1개의 이미지 태그를 선택해주세요', 'error');
        return false;
    }
    
    console.log('✅ Validation passed');
    return true;
}

// ===== Upload Images to Storage =====
async function uploadImages() {
    console.log('📤 Uploading images to Supabase Storage...');
    
    if (!window.supabase) {
        console.error('❌ Supabase client not available');
        return null;
    }
    
    const uploadedUrls = [];
    
    for (let i = 0; i < state.selectedImages.length; i++) {
        const img = state.selectedImages[i];
        const fileName = `${state.userId}_${Date.now()}_${i}.jpg`;
        const filePath = `dancers/${fileName}`;
        
        console.log(`📸 Uploading image ${i + 1}/${state.selectedImages.length}: ${fileName}`);
        
        try {
            // Upload to Supabase Storage
            const { data, error } = await window.supabase.storage
                .from('profile-images')
                .upload(filePath, img.file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) {
                console.error('❌ Upload error:', error);
                // Use data URL as fallback
                uploadedUrls.push(img.dataUrl);
            } else {
                console.log('✅ Uploaded:', filePath);
                
                // Get public URL
                const { data: urlData } = window.supabase.storage
                    .from('profile-images')
                    .getPublicUrl(filePath);
                
                uploadedUrls.push(urlData.publicUrl);
            }
        } catch (err) {
            console.error('❌ Upload exception:', err);
            // Use data URL as fallback
            uploadedUrls.push(img.dataUrl);
        }
    }
    
    console.log('✅ All images processed:', uploadedUrls.length);
    return uploadedUrls;
}

// ===== Show Loading Overlay =====
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// ===== Show Toast Notification =====
function showToast(message, type = 'success') {
    console.log('📢 Toast:', message, type);
    
    let toast = document.getElementById('toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
