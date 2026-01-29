// =====================================
//  UTOPIA X - Client Profile Management
//  클라이언트 프로필 관리 페이지
// =====================================

let currentUser = null;
let currentLogoUrl = null;

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
    console.log('🔐 Checking authentication...');
    
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
            .select('company_name, website_url, logo_url')
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
            
            // Show logo if exists
            if (clientData.logo_url) {
                currentLogoUrl = clientData.logo_url;
                showLogoPreview(clientData.logo_url);
            }
        } else {
            console.log('ℹ️ No client data found (new user)');
        }
        
    } catch (error) {
        console.error('❌ Exception loading user data:', error);
        showToast('사용자 정보를 불러오는데 실패했습니다', 'error');
    }
}

// Show logo preview
function showLogoPreview(url) {
    const img = document.getElementById('logoPreviewImg');
    const placeholder = document.getElementById('logoPlaceholder');
    const removeBtn = document.getElementById('removeLogo');
    
    img.src = url;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    removeBtn.style.display = 'inline-flex';
}

// Hide logo preview
function hideLogoPreview() {
    const img = document.getElementById('logoPreviewImg');
    const placeholder = document.getElementById('logoPlaceholder');
    const removeBtn = document.getElementById('removeLogo');
    
    img.style.display = 'none';
    placeholder.style.display = 'flex';
    removeBtn.style.display = 'none';
    currentLogoUrl = null;
}

// Bind events
function bindEvents() {
    // Logo upload change
    document.getElementById('logoUpload').addEventListener('change', handleLogoUpload);
    
    // Remove logo button
    document.getElementById('removeLogo').addEventListener('click', () => {
        hideLogoPreview();
        document.getElementById('logoUpload').value = '';
    });
    
    // Form submit
    document.getElementById('profileForm').addEventListener('submit', handleSubmit);
}

// Handle logo upload
async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('📤 Uploading logo:', file.name);
    
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
        showLogoPreview(e.target.result);
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
        
        // Upload logo if changed
        let logoUrl = currentLogoUrl;
        const logoFile = document.getElementById('logoUpload').files[0];
        
        if (logoFile) {
            console.log('📤 Uploading new logo to Supabase Storage...');
            
            const fileExt = logoFile.name.split('.').pop();
            const fileName = `${currentUser.id}_${Date.now()}.${fileExt}`;
            const filePath = `logos/${fileName}`;
            
            const { data: uploadData, error: uploadError } = await window.supabase.storage
                .from('assets')
                .upload(filePath, logoFile, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (uploadError) {
                console.error('❌ Logo upload failed:', uploadError);
                showToast('로고 업로드에 실패했습니다', 'error');
            } else {
                // Get public URL
                const { data: urlData } = window.supabase.storage
                    .from('assets')
                    .getPublicUrl(filePath);
                
                logoUrl = urlData.publicUrl;
                console.log('✅ Logo uploaded:', logoUrl);
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
                logo_url: logoUrl
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
    
    .logo-upload-container {
        display: flex;
        align-items: center;
        gap: 15px;
        flex-wrap: wrap;
    }
    
    .logo-preview {
        width: 150px;
        height: 150px;
        border: 2px dashed #e5e7eb;
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: #f9fafb;
    }
    
    .logo-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .logo-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        color: #9ca3af;
        text-align: center;
        padding: 20px;
    }
    
    .logo-placeholder i {
        font-size: 48px;
    }
    
    .logo-placeholder p {
        font-size: 13px;
        margin: 0;
    }
`;
document.head.appendChild(style);

console.log('✅ Client Profile JS loaded');
