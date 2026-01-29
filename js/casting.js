// =====================================
//  UTOPIA X - Casting Request Module
//  댄서 섭외 신청 팝업 연동
// =====================================

const CastingModule = {
    // Initialize casting modal
    init() {
        console.log('🎬 Initializing Casting Module...');
        this.bindFormSubmit();
        this.bindModalOpen();
        console.log('✅ Casting Module initialized');
    },
    
    // Bind modal open event to auto-fill user data
    bindModalOpen() {
        const castingModal = document.getElementById('castingModal');
        
        if (!castingModal) {
            console.error('❌ castingModal not found');
            return;
        }
        
        // Create MutationObserver to detect when modal is shown
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const isVisible = castingModal.style.display === 'flex';
                    
                    if (isVisible) {
                        console.log('🔓 Casting modal opened - auto-filling user data...');
                        this.autoFillUserData();
                    }
                }
            });
        });
        
        observer.observe(castingModal, {
            attributes: true,
            attributeFilter: ['style']
        });
        
        console.log('✅ Casting modal observer bound');
    },
    
    // Auto-fill user data from sessionStorage and Supabase
    async autoFillUserData() {
        console.log('📝 Auto-filling user data...');
        
        try {
            // Get user info from sessionStorage (fast)
            const userEmail = sessionStorage.getItem('userEmail');
            const userName = sessionStorage.getItem('userName');
            const userPhone = sessionStorage.getItem('userPhone');
            
            console.log('📦 SessionStorage data:', { userEmail, userName, userPhone });
            
            // Fill email immediately (from sessionStorage or Supabase auth)
            const emailInput = document.getElementById('clientEmail');
            if (emailInput && userEmail && userEmail !== 'Login') {
                emailInput.value = userEmail;
                console.log('✅ Email auto-filled:', userEmail);
            }
            
            // If we have name and phone in sessionStorage, fill them
            const nameInput = document.getElementById('modalClientName');
            const phoneInput = document.getElementById('modalClientPhone');
            
            if (userName && userName !== 'null') {
                if (nameInput) nameInput.value = userName;
                console.log('✅ Name auto-filled from sessionStorage:', userName);
            }
            
            if (userPhone && userPhone !== 'null') {
                if (phoneInput) phoneInput.value = userPhone;
                console.log('✅ Phone auto-filled from sessionStorage:', userPhone);
            }
            
            // If sessionStorage doesn't have complete data, fetch from Supabase
            if ((!userName || userName === 'null') || (!userPhone || userPhone === 'null')) {
                console.log('⚠️ Incomplete sessionStorage data - fetching from Supabase...');
                await this.fetchUserDataFromSupabase();
            }
            
        } catch (error) {
            console.error('❌ Error auto-filling user data:', error);
        }
    },
    
    // Fetch user data from Supabase
    async fetchUserDataFromSupabase() {
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase not available');
            return;
        }
        
        try {
            // Get current user
            const { data: { user }, error: authError } = await window.supabase.auth.getUser();
            
            if (authError || !user) {
                console.error('❌ Failed to get current user:', authError);
                return;
            }
            
            console.log('👤 Current user ID:', user.id);
            
            // Query users table
            const { data: userData, error: dbError } = await window.supabase
                .from('users')
                .select('name, phone')
                .eq('id', user.id)
                .single();
            
            if (dbError) {
                console.error('❌ Failed to fetch user data from DB:', dbError);
                return;
            }
            
            console.log('📦 User data from DB:', userData);
            
            // Fill form fields
            const nameInput = document.getElementById('modalClientName');
            const phoneInput = document.getElementById('modalClientPhone');
            
            if (userData.name && nameInput && !nameInput.value) {
                nameInput.value = userData.name;
                console.log('✅ Name auto-filled from DB:', userData.name);
            }
            
            if (userData.phone && phoneInput && !phoneInput.value) {
                phoneInput.value = userData.phone;
                console.log('✅ Phone auto-filled from DB:', userData.phone);
            }
            
            // Update sessionStorage for future use
            if (userData.name) sessionStorage.setItem('userName', userData.name);
            if (userData.phone) sessionStorage.setItem('userPhone', userData.phone);
            
        } catch (error) {
            console.error('❌ Exception fetching user data:', error);
        }
    },
    
    // Bind form submit event
    bindFormSubmit() {
        const castingForm = document.getElementById('castingForm');
        
        if (!castingForm) {
            console.error('❌ castingForm not found');
            return;
        }
        
        castingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('📤 Casting form submitted');
            
            await this.submitCastingRequest(castingForm);
        });
        
        console.log('✅ Casting form submit event bound');
    },
    
    // Submit casting request to Supabase
    async submitCastingRequest(form) {
        console.log('🚀 Submitting casting request...');
        
        // Validate Supabase
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase not available');
            this.showToast('데이터베이스 연결에 실패했습니다', 'error');
            return;
        }
        
        try {
            // Get current user ID
            const { data: { user }, error: authError } = await window.supabase.auth.getUser();
            
            if (authError || !user) {
                console.error('❌ Failed to get current user:', authError);
                this.showToast('로그인 정보를 확인할 수 없습니다', 'error');
                return;
            }
            
            // Get form data
            const formData = new FormData(form);
            
            const requestData = {
                user_id: user.id,
                name: formData.get('clientName'),
                email: formData.get('clientEmail'),
                phone: formData.get('clientPhone'),
                event_date: formData.get('eventDate'),
                project_type: formData.get('eventType'),
                dancer_count: parseInt(formData.get('dancerCount')),
                budget: parseInt(formData.get('budget')),
                ai_prompt: formData.get('aiPrompt'),
                message: formData.get('message') || '',
                status: 'pending'
            };
            
            console.log('📦 Request data:', requestData);
            
            // Show loading indicator
            const loadingIndicator = document.getElementById('aiLoadingIndicator');
            const submitButton = form.querySelector('button[type="submit"]');
            
            if (loadingIndicator) loadingIndicator.style.display = 'block';
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...';
            }
            
            // Insert into requests table
            const { data, error } = await window.supabase
                .from('requests')
                .insert([requestData])
                .select();
            
            // Hide loading
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            
            if (error) {
                console.error('❌ Failed to insert request:', error);
                this.showToast('섭외 신청에 실패했습니다: ' + error.message, 'error');
                
                // Restore button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-robot"></i> AI 매칭 신청하기';
                }
                return;
            }
            
            console.log('✅ Request submitted successfully:', data);
            
            // Show success message
            this.showToast('섭외 신청이 완료되었습니다! 곧 연락드리겠습니다 🎉', 'success');
            
            // Reset form and close modal
            form.reset();
            
            // Restore button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-robot"></i> AI 매칭 신청하기';
            }
            
            // Close modal after 1.5 seconds
            setTimeout(() => {
                if (typeof UIModule !== 'undefined' && typeof UIModule.closeModal === 'function') {
                    UIModule.closeModal('castingModal');
                } else {
                    const castingModal = document.getElementById('castingModal');
                    if (castingModal) castingModal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            }, 1500);
            
        } catch (error) {
            console.error('❌ Exception submitting casting request:', error);
            this.showToast('섭외 신청 중 오류가 발생했습니다', 'error');
        }
    },
    
    // Show toast notification
    showToast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else if (typeof UIModule !== 'undefined' && typeof UIModule.showToast === 'function') {
            UIModule.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
            alert(message);
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        CastingModule.init();
    });
} else {
    CastingModule.init();
}

// Export for global access
window.CastingModule = CastingModule;

console.log('✅ Casting Module loaded');
