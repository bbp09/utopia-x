// =====================================
//  UTOPIA X - Client Profile Management
//  클라이언트 프로필 관리 페이지
// =====================================

let currentUser = null;
let currentProfileImageUrl = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📝 Initializing Client Profile Page...');
    
    // Check authentication
    await checkAuth();
    
    // Load user data
    await loadUserData();
    
    // Bind events
    bindEvents();
    
    console.log('✅ Client Profile Page initialized');
});

// Check authentication
async function checkAuth() {
    console.log('🔐 Checking authentication (prototype mode)...');
    
    /* 프로토타입 모드: 로그인 체크 비활성화
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase not available');
        alert('데이터베이스 연결에 실패했습니다');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const { data: { user }, error } = await window.supabase.auth.getUser();
        
        if (error || !user) {
            console.error('❌ Not logged in:', error);
            alert('로그인이 필요합니다');
            window.location.href = 'index.html';
            return;
        }
        
        currentUser = user;
        console.log('✅ User authenticated:', user.id);
        
    } catch (error) {
        console.error('❌ Auth check failed:', error);
        window.location.href = 'index.html';
    }
    */
    
    // 프로토타입용 가짜 사용자
    currentUser = {
        id: 'prototype-user-001',
        email: 'prototype@utopia-x.com'
    };
    console.log('✅ Prototype user set:', currentUser);
}

// Load user data from Supabase
async function loadUserData() {
    console.log('📦 Loading user data...');
    
    if (!currentUser) return;
    
    try {
        // Load from users table
        const { data: userData, error: userError } = await window.supabase
            .from('users')
            .select('name, phone, email')
            .eq('id', currentUser.id)
            .single();
        
        if (userError) {
            console.error('❌ Failed to load user data:', userError);
            return;
        }
        
        console.log('✅ User data loaded:', userData);
        
        // Fill personal information
        document.getElementById('name').value = userData.name || '';
        document.getElementById('phone').value = userData.phone || '';
        document.getElementById('email').value = userData.email || currentUser.email;
        
        // Load from clients table
        const { data: clientData, error: clientError } = await window.supabase
            .from('clients')
            .select('company_name, website_url, profile_image')
            .eq('user_id', currentUser.id)
            .single();
        
        if (clientError && clientError.code !== 'PGRST116') {
            // PGRST116 = no rows returned (which is fine for new users)
            console.error('❌ Failed to load client data:', clientError);
            return;
        }
        
        if (clientData) {
            console.log('✅ Client data loaded:', clientData);
            
            // Fill company information
            document.getElementById('companyName').value = clientData.company_name || '';
            document.getElementById('websiteUrl').value = clientData.website_url || '';
            
            // Show profile image if exists
            if (clientData.profile_image) {
                currentProfileImageUrl = clientData.profile_image;
                showProfilePreview(clientData.profile_image);
            }
        } else {
            console.log('ℹ️ No client data found (new user)');
        }
        
        // Update business card preview
        updateBusinessCardPreview();
        
    } catch (error) {
        console.error('❌ Exception loading user data:', error);
        showToast('사용자 정보를 불러오는데 실패했습니다', 'error');
    }
}

// Show profile preview
function showProfilePreview(url) {
    const img = document.getElementById('profilePreviewImg');
    const placeholder = document.getElementById('profilePlaceholder');
    const removeBtn = document.getElementById('removeProfile');
    const cardImg = document.getElementById('cardProfileImg');
    
    img.src = url;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    removeBtn.style.display = 'inline-flex';
    
    // Update business card preview
    if (cardImg) cardImg.src = url;
}

// Hide profile preview
function hideProfilePreview() {
    const img = document.getElementById('profilePreviewImg');
    const placeholder = document.getElementById('profilePlaceholder');
    const removeBtn = document.getElementById('removeProfile');
    const cardImg = document.getElementById('cardProfileImg');
    
    img.style.display = 'none';
    placeholder.style.display = 'flex';
    removeBtn.style.display = 'none';
    currentProfileImageUrl = null;
    
    // Reset business card preview
    if (cardImg) cardImg.src = 'https://via.placeholder.com/80?text=Photo';
}

// Update business card preview
function updateBusinessCardPreview() {
    const cardName = document.getElementById('cardName');
    const cardCompany = document.getElementById('cardCompany');
    const cardPhone = document.getElementById('cardPhone');
    
    const name = document.getElementById('name').value || '홍길동';
    const company = document.getElementById('companyName').value || '회사명';
    const phone = document.getElementById('phone').value || '010-0000-0000';
    
    if (cardName) cardName.textContent = name;
    if (cardCompany) cardCompany.textContent = company;
    if (cardPhone) cardPhone.textContent = phone;
}

// Bind events
function bindEvents() {
    // Profile upload change
    document.getElementById('profileUpload').addEventListener('change', handleProfileUpload);
    
    // Remove profile button
    document.getElementById('removeProfile').addEventListener('click', () => {
        hideProfilePreview();
        document.getElementById('profileUpload').value = '';
    });
    
    // Update business card preview on input change
    document.getElementById('name').addEventListener('input', updateBusinessCardPreview);
    document.getElementById('companyName').addEventListener('input', updateBusinessCardPreview);
    document.getElementById('phone').addEventListener('input', updateBusinessCardPreview);
    
    // Form submit
    document.getElementById('profileForm').addEventListener('submit', handleSubmit);
}

// Handle profile upload
async function handleProfileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('📤 Uploading profile image:', file.name);
    
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
        showProfilePreview(e.target.result);
    };
    reader.readAsDataURL(file);
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
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const companyName = document.getElementById('companyName').value.trim();
        const websiteUrl = document.getElementById('websiteUrl').value.trim();
        
        // Upload profile image if changed
        let profileImageUrl = currentProfileImageUrl;
        const profileFile = document.getElementById('profileUpload').files[0];
        
        if (profileFile) {
            console.log('📤 Uploading new profile image to Supabase Storage...');
            
            const fileExt = profileFile.name.split('.').pop();
            const fileName = `${currentUser.id}_${Date.now()}.${fileExt}`;
            const filePath = `profiles/${fileName}`;
            
            const { data: uploadData, error: uploadError } = await window.supabase.storage
                .from('assets')
                .upload(filePath, profileFile, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (uploadError) {
                console.error('❌ Profile image upload failed:', uploadError);
                showToast('프로필 사진 업로드에 실패했습니다', 'error');
            } else {
                // Get public URL
                const { data: urlData } = window.supabase.storage
                    .from('assets')
                    .getPublicUrl(filePath);
                
                profileImageUrl = urlData.publicUrl;
                console.log('✅ Profile image uploaded:', profileImageUrl);
            }
        }
        
        // Update users table
        const { error: userError } = await window.supabase
            .from('users')
            .update({
                name: name,
                phone: phone
            })
            .eq('id', currentUser.id);
        
        if (userError) {
            console.error('❌ Failed to update user:', userError);
            showToast('개인 정보 저장에 실패했습니다', 'error');
            return;
        }
        
        console.log('✅ User data updated');
        
        // Upsert clients table
        const { error: clientError } = await window.supabase
            .from('clients')
            .upsert({
                user_id: currentUser.id,
                company_name: companyName,
                website_url: websiteUrl,
                profile_image: profileImageUrl
            }, {
                onConflict: 'user_id'
            });
        
        if (clientError) {
            console.error('❌ Failed to update client:', clientError);
            showToast('회사 정보 저장에 실패했습니다', 'error');
            return;
        }
        
        console.log('✅ Client data updated');
        
        // Update sessionStorage
        sessionStorage.setItem('userName', name);
        sessionStorage.setItem('userPhone', phone);
        
        // Show success
        showToast('정보가 성공적으로 저장되었습니다! 🎉', 'success');
        
        // Reload data
        setTimeout(async () => {
            await loadUserData();
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
    
    .profile-upload-container {
        display: flex;
        gap: 20px;
        align-items: flex-start;
    }
    
    .profile-preview {
        width: 150px;
        height: 150px;
        border: 3px solid #e5e7eb;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
        flex-shrink: 0;
    }
    
    .profile-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .profile-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: #9ca3af;
        text-align: center;
        padding: 20px;
    }
    
    .profile-placeholder i {
        font-size: 48px;
    }
    
    .profile-placeholder p {
        font-size: 12px;
        margin: 0;
        line-height: 1.4;
    }
    
    .profile-upload-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .business-card-preview {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 30px;
        display: flex;
        align-items: center;
        gap: 20px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    }
    
    .card-profile {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid white;
        flex-shrink: 0;
    }
    
    .card-profile img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .card-info {
        color: white;
    }
    
    .card-info h3 {
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 8px 0;
    }
    
    .card-info p {
        font-size: 14px;
        margin: 4px 0;
        opacity: 0.9;
    }
`;
document.head.appendChild(style);

console.log('✅ Client Profile JS loaded');
