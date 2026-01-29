// =====================================
//  UTOPIA X - Dashboard Common Scripts
//  대시보드 공통 기능 (드롭다운, 크레딧 로딩)
// =====================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📊 Dashboard Common: Initializing...');
    
    // Initialize dropdown events
    initDropdownEvents();
    
    // Load user info
    await loadUserInfo();
    
    console.log('✅ Dashboard Common: Initialized');
});

// Initialize dropdown menu events
function initDropdownEvents() {
    console.log('🎯 Initializing dropdown events...');
    
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenuDropdown = document.getElementById('userMenuDropdown');
    
    if (!userMenuBtn || !userMenuDropdown) {
        console.error('❌ Dropdown elements not found');
        return;
    }
    
    // Toggle dropdown
    userMenuBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isOpen = userMenuDropdown.classList.contains('show');
        
        if (isOpen) {
            userMenuDropdown.classList.remove('show');
            console.log('✅ Dropdown closed');
        } else {
            userMenuDropdown.classList.add('show');
            console.log('✅ Dropdown opened');
            
            // Load credits when dropdown opens
            await loadUserCredits();
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !userMenuDropdown.contains(e.target)) {
            userMenuDropdown.classList.remove('show');
        }
    });
    
    // Bind dropdown menu items
    const btnMyProfile = document.getElementById('btnMyProfile');
    const btnCreditCharge = document.getElementById('btnCreditCharge');
    const btnLogout = document.getElementById('btnLogout');
    
    if (btnMyProfile) {
        btnMyProfile.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'client-profile.html';
        });
    }
    
    if (btnCreditCharge) {
        btnCreditCharge.addEventListener('click', (e) => {
            e.preventDefault();
            alert('크레딧 충전 기능은 준비 중입니다');
        });
    }
    
    if (btnLogout) {
        btnLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (typeof window.supabase !== 'undefined') {
                await window.supabase.auth.signOut();
            }
            
            sessionStorage.clear();
            window.location.href = 'index.html';
        });
    }
    
    console.log('✅ Dropdown events bound');
}

// Load user info and display
async function loadUserInfo() {
    console.log('👤 Loading user info...');
    
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    
    if (!userEmailDisplay) {
        console.error('❌ userEmailDisplay not found');
        return;
    }
    
    try {
        // Get from sessionStorage first (fast)
        const userEmail = sessionStorage.getItem('userEmail');
        
        if (userEmail && userEmail !== 'Login') {
            userEmailDisplay.textContent = userEmail;
            console.log('✅ User email loaded:', userEmail);
            return;
        }
        
        // Fallback to Supabase
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase not available');
            return;
        }
        
        const { data: { user }, error } = await window.supabase.auth.getUser();
        
        if (error || !user) {
            console.error('❌ Failed to get user:', error);
            userEmailDisplay.textContent = 'Login';
            return;
        }
        
        userEmailDisplay.textContent = user.email;
        sessionStorage.setItem('userEmail', user.email);
        console.log('✅ User email loaded from Supabase:', user.email);
        
    } catch (error) {
        console.error('❌ Exception loading user info:', error);
        userEmailDisplay.textContent = 'Error';
    }
}

// Load user credits
async function loadUserCredits() {
    console.log('💰 Loading user credits...');
    
    const creditDisplay = document.getElementById('creditDisplay');
    if (!creditDisplay) {
        console.error('❌ creditDisplay not found');
        return;
    }
    
    try {
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase not available');
            return;
        }
        
        const { data: { user }, error: authError } = await window.supabase.auth.getUser();
        
        if (authError || !user) {
            console.error('❌ Failed to get current user:', authError);
            creditDisplay.textContent = '0';
            return;
        }
        
        // Query users table for credits
        const { data: userData, error: dbError } = await window.supabase
            .from('users')
            .select('credits')
            .eq('id', user.id)
            .single();
        
        if (dbError) {
            console.error('❌ Failed to fetch credits:', dbError);
            creditDisplay.textContent = '0';
            return;
        }
        
        const credits = userData?.credits || 0;
        creditDisplay.textContent = credits;
        
        console.log('✅ Credits loaded:', credits);
        
    } catch (error) {
        console.error('❌ Exception loading credits:', error);
        creditDisplay.textContent = '0';
    }
}

console.log('✅ Dashboard Common script loaded');
