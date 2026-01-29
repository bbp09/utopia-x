// =====================================
//  UTOPIA X - Main JavaScript (Refactored)
//  안정적이고 유지보수하기 쉬운 구조
// =====================================

// =====================================
// 1. GLOBAL STATE (전역 상태 관리)
// =====================================
const AppState = {
    // User state
    currentUser: null,
    userEmail: null,
    userRole: null,
    userType: null,
    credits: 0,
    
    // Data state
    dancers: [],
    featuredDancers: [],
    aiMatchResults: null,
    
    // UI state
    isLoading: false,
    activeModal: null,
    dropdownOpen: false,
    
    // Methods
    setUser(user) {
        this.currentUser = user;
        this.userEmail = user?.email || null;
        this.userRole = user?.role || null;
        this.userType = user?.userType || null;
        console.log('✅ User state updated:', this.userEmail);
    },
    
    clearUser() {
        this.currentUser = null;
        this.userEmail = null;
        this.userRole = null;
        this.userType = null;
        this.credits = 0;
        console.log('✅ User state cleared');
    },
    
    updateCredits(amount) {
        this.credits = amount;
        UIModule.updateCreditDisplay(amount);
    }
};

// =====================================
// 2. AUTH MODULE (인증 모듈)
// =====================================
const AuthModule = {
    // Check user session on page load
    async checkUserSession() {
        console.log('🔍 Checking user session...');
        
        // CRITICAL: Use sessionStorage first (synchronous, fast)
        const userEmail = sessionStorage.getItem('userEmail');
        const userRole = sessionStorage.getItem('userRole');
        const userType = sessionStorage.getItem('userType');
        
        if (userEmail && userEmail !== 'Login') {
            AppState.setUser({
                email: userEmail,
                role: userRole,
                userType: userType
            });
            
            // Update UI immediately
            UIModule.updateHeaderForLoggedInUser(userEmail);
            console.log('✅ User session restored from sessionStorage');
        } else {
            UIModule.updateHeaderForGuest();
            console.log('ℹ️ No active user session');
        }
        
        // Then check Supabase (async, slower)
        if (typeof window.supabase !== 'undefined') {
            try {
                const { data: { user } } = await window.supabase.auth.getUser();
                if (user) {
                    AppState.setUser({
                        email: user.email,
                        role: user.user_metadata?.userRole,
                        userType: user.user_metadata?.user_type
                    });
                    console.log('✅ Supabase user verified');
                }
            } catch (error) {
                console.warn('⚠️ Supabase auth check failed:', error);
            }
        }
    },
    
    // Check if user is logged in
    isLoggedIn() {
        return !!(AppState.userEmail && AppState.userEmail !== 'Login');
    },
    
    // Get current user
    getCurrentUser() {
        return AppState.currentUser;
    },
    
    // Handle login (delegates to supabase-auth.js)
    async handleLogin(email, password) {
        console.log('🔐 Handling login...');
        
        if (typeof window.signIn === 'function') {
            const result = await window.signIn(email, password);
            
            if (result.success) {
                // ✅ CRITICAL FIX #2: No redirect! Just close modal and update UI
                const user = result.data?.user;
                if (user) {
                    AppState.setUser({
                        email: user.email,
                        role: user.user_metadata?.userRole,
                        userType: user.user_metadata?.user_type
                    });
                    
                    // Save to sessionStorage
                    sessionStorage.setItem('userEmail', user.email);
                    sessionStorage.setItem('userRole', user.user_metadata?.userRole || 'client');
                    sessionStorage.setItem('userType', user.user_metadata?.user_type || 'client');
                }
                
                // Close modal and update header (no redirect!)
                UIModule.closeModal('loginModal');
                UIModule.updateHeaderForLoggedInUser(AppState.userEmail);
                
                console.log('✅ Login successful - staying on current page');
            }
            
            return result;
        }
        
        console.error('❌ signIn function not found');
        return { success: false, error: 'Auth system not available' };
    },
    
    // Handle logout
    async handleLogout() {
        console.log('🚪 Handling logout...');
        
        if (typeof window.signOut === 'function') {
            await window.signOut();
        }
        
        // Clear state
        AppState.clearUser();
        sessionStorage.clear();
        
        // Update UI
        UIModule.updateHeaderForGuest();
        UIModule.closeAllDropdowns();
        
        console.log('✅ Logout complete');
    }
};

// =====================================
// 3. UI MODULE (UI 관리 모듈)
// =====================================
const UIModule = {
    // DOM Elements cache
    elements: {
        userMenuBtn: null,
        userEmailDisplay: null,
        userMenuDropdown: null,
        loginModal: null,
        signUpStep1: null,
        signUpStep2: null,
    },
    
    // Initialize DOM references
    initElements() {
        this.elements = {
            userMenuBtn: document.getElementById('userMenuBtn'),
            userEmailDisplay: document.getElementById('userEmailDisplay'),
            userMenuDropdown: document.getElementById('userMenuDropdown'),
            loginModal: document.getElementById('loginModal'),
            signUpStep1: document.getElementById('signUpStep1'),
            signUpStep2: document.getElementById('signUpStep2'),
        };
        
        console.log('✅ DOM elements cached');
    },
    
    // Update header for logged-in user
    updateHeaderForLoggedInUser(email) {
        if (this.elements.userEmailDisplay) {
            this.elements.userEmailDisplay.textContent = email;
            console.log('✅ Header updated for logged-in user:', email);
        }
    },
    
    // Update header for guest
    updateHeaderForGuest() {
        if (this.elements.userEmailDisplay) {
            this.elements.userEmailDisplay.textContent = 'Login';
            console.log('✅ Header updated for guest');
        }
    },
    
    // Update credit display
    updateCreditDisplay(amount) {
        const creditDisplay = document.getElementById('creditDisplay');
        if (creditDisplay) {
            creditDisplay.textContent = amount;
        }
    },
    
    // Open modal
    openModal(modalId) {
        console.log('🔓 Opening modal:', modalId);
        
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error('❌ Modal not found:', modalId);
            return;
        }
        
        modal.style.display = 'flex';
        AppState.activeModal = modalId;
        
        // Special handling for loginModal
        if (modalId === 'loginModal') {
            this.initLoginModal();
        }
        
        console.log('✅ Modal opened:', modalId);
    },
    
    // Close modal
    closeModal(modalId) {
        console.log('🔒 Closing modal:', modalId);
        
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            AppState.activeModal = null;
            console.log('✅ Modal closed:', modalId);
        }
    },
    
    // Close all modals
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        AppState.activeModal = null;
        console.log('✅ All modals closed');
    },
    
    // Initialize login modal to Sign In tab
    initLoginModal() {
        console.log('🔧 Initializing login modal to Sign In tab...');
        
        const signInTab = document.querySelector('.auth-tab[data-tab="signin"]');
        const signUpTab = document.querySelector('.auth-tab[data-tab="signup"]');
        const signInForm = document.getElementById('signInForm');
        const signUpStep1 = document.getElementById('signUpStep1');
        const signUpStep2 = document.getElementById('signUpStep2');
        const authModalTitle = document.getElementById('authModalTitle');
        const authModalSubtitle = document.getElementById('authModalSubtitle');
        
        // Activate Sign In tab
        if (signInTab) signInTab.classList.add('active');
        if (signUpTab) signUpTab.classList.remove('active');
        
        // Update title
        if (authModalTitle) authModalTitle.textContent = 'UTOPIA X 로그인';
        if (authModalSubtitle) authModalSubtitle.textContent = '이메일로 간편하게 시작하세요';
        
        // Show Sign In form only
        if (signInForm) {
            signInForm.style.display = 'block';
            signInForm.classList.add('active');
        }
        if (signUpStep1) {
            signUpStep1.style.display = 'none';
            signUpStep1.classList.remove('active');
        }
        if (signUpStep2) {
            signUpStep2.style.display = 'none';
            signUpStep2.classList.remove('active');
        }
        
        console.log('✅ Login modal initialized to Sign In tab');
    },
    
    // Open signup modal with type selection
    openSignupModal() {
        console.log('📝 Opening signup modal with type selection...');
        
        const signInTab = document.querySelector('.auth-tab[data-tab="signin"]');
        const signUpTab = document.querySelector('.auth-tab[data-tab="signup"]');
        const signInForm = document.getElementById('signInForm');
        const signUpStep1 = document.getElementById('signUpStep1');
        const signUpStep2 = document.getElementById('signUpStep2');
        const authModalTitle = document.getElementById('authModalTitle');
        const authModalSubtitle = document.getElementById('authModalSubtitle');
        
        // Activate Sign Up tab
        if (signInTab) signInTab.classList.remove('active');
        if (signUpTab) signUpTab.classList.add('active');
        
        // Update title
        if (authModalTitle) authModalTitle.textContent = '회원가입';
        if (authModalSubtitle) authModalSubtitle.textContent = '맞춤형 서비스를 위한 유형 선택';
        
        // Show Step 1 (type selection) only
        if (signInForm) {
            signInForm.style.display = 'none';
            signInForm.classList.remove('active');
        }
        if (signUpStep1) {
            signUpStep1.style.display = 'block';
            signUpStep1.classList.add('active');
        }
        if (signUpStep2) {
            signUpStep2.style.display = 'none';
            signUpStep2.classList.remove('active');
        }
        
        console.log('✅ Signup modal opened with type selection');
    },
    
    // ✅ CRITICAL FIX #1: Handle user type selection (Client/Artist)
    selectUserType(type) {
        console.log('🎯 User type selected:', type);
        
        const signUpStep1 = document.getElementById('signUpStep1');
        const signUpStep2 = document.getElementById('signUpStep2');
        const selectedUserType = document.getElementById('selectedUserType');
        
        // Validate required elements
        if (!signUpStep1 || !signUpStep2) {
            console.error('❌ Required signup steps not found!');
            showToast('회원가입 양식을 불러올 수 없습니다', 'error');
            return;
        }
        
        // Set selected user type
        if (selectedUserType) {
            selectedUserType.value = type;
        }
        
        // Update form fields based on type
        const clientFields = document.getElementById('clientFields');
        const artistFields = document.getElementById('artistFields');
        const step2Title = document.getElementById('step2Title');
        const step2Subtitle = document.getElementById('step2Subtitle');
        
        if (type === 'client') {
            // Show client fields
            if (clientFields) clientFields.style.display = 'block';
            if (artistFields) artistFields.style.display = 'none';
            
            // Update title
            if (step2Title) step2Title.textContent = '클라이언트 정보 입력';
            if (step2Subtitle) step2Subtitle.textContent = '필수 정보만 입력해주세요 (빠른 가입)';
            
            // Set required fields
            const clientName = document.getElementById('clientName');
            const clientPhone = document.getElementById('clientPhone');
            if (clientName) clientName.required = true;
            if (clientPhone) clientPhone.required = true;
            
            const artistStageName = document.getElementById('artistStageName');
            const artistPhone = document.getElementById('artistPhone');
            if (artistStageName) artistStageName.required = false;
            if (artistPhone) artistPhone.required = false;
            
            console.log('✅ Client fields configured');
        } else {
            // Show artist fields
            if (clientFields) clientFields.style.display = 'none';
            if (artistFields) artistFields.style.display = 'block';
            
            // Update title
            if (step2Title) step2Title.textContent = '아티스트 정보 입력';
            if (step2Subtitle) step2Subtitle.textContent = '필수 정보만 입력해주세요 (빠른 가입)';
            
            // Set required fields
            const artistStageName = document.getElementById('artistStageName');
            const artistPhone = document.getElementById('artistPhone');
            if (artistStageName) artistStageName.required = true;
            if (artistPhone) artistPhone.required = true;
            
            const clientName = document.getElementById('clientName');
            const clientPhone = document.getElementById('clientPhone');
            if (clientName) clientName.required = false;
            if (clientPhone) clientPhone.required = false;
            
            console.log('✅ Artist fields configured');
        }
        
        // Switch to Step 2 (form input)
        signUpStep1.style.display = 'none';
        signUpStep2.style.display = 'block';
        
        console.log('✅ User type selection complete - Step 2 shown');
    },
    
    // Back to type selection
    backToStep1() {
        console.log('⬅️ Returning to Step 1...');
        
        const signUpStep1 = document.getElementById('signUpStep1');
        const signUpStep2 = document.getElementById('signUpStep2');
        
        if (signUpStep1) signUpStep1.style.display = 'block';
        if (signUpStep2) {
            signUpStep2.style.display = 'none';
            // Reset form
            const form = signUpStep2.querySelector('form');
            if (form) form.reset();
        }
        
        console.log('✅ Returned to Step 1');
    },
    
    // Toggle dropdown
    toggleDropdown() {
        if (!this.elements.userMenuDropdown) return;
        
        const isOpen = this.elements.userMenuDropdown.classList.contains('show');
        
        if (isOpen) {
            this.closeAllDropdowns();
        } else {
            this.elements.userMenuDropdown.classList.add('show');
            AppState.dropdownOpen = true;
            console.log('✅ Dropdown opened');
        }
    },
    
    // Close all dropdowns
    closeAllDropdowns() {
        if (this.elements.userMenuDropdown) {
            this.elements.userMenuDropdown.classList.remove('show');
            AppState.dropdownOpen = false;
            console.log('✅ Dropdown closed');
        }
    },
    
    // Show toast notification
    showToast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
};

// =====================================
// 4. EVENT MODULE (이벤트 관리 모듈)
// =====================================
const EventModule = {
    // Initialize all event listeners
    init() {
        console.log('🎯 Initializing event listeners...');
        
        this.bindHeaderEvents();
        this.bindAuthEvents();
        this.bindModalEvents();
        this.bindCTAEvents();
        this.bindDropdownEvents();
        this.bindDashboardEvents();
        this.bindGlobalEvents();
        
        console.log('✅ All event listeners initialized');
    },
    
    // Bind header events
    bindHeaderEvents() {
        const userMenuBtn = UIModule.elements.userMenuBtn;
        
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🖱️ User menu button clicked');
                
                // Check login status
                if (!AuthModule.isLoggedIn()) {
                    console.log('ℹ️ Not logged in - opening login modal');
                    UIModule.openModal('loginModal');
                } else {
                    console.log('ℹ️ Logged in - toggling dropdown');
                    UIModule.toggleDropdown();
                }
            });
            
            console.log('✅ User menu button event bound');
        }
    },
    
    // Bind auth form events
    bindAuthEvents() {
        // Sign In form
        const signInForm = document.getElementById('signInForm');
        if (signInForm) {
            signInForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('signInEmail')?.value;
                const password = document.getElementById('signInPassword')?.value;
                
                if (email && password) {
                    await AuthModule.handleLogin(email, password);
                }
            });
            
            console.log('✅ Sign In form event bound');
        }
        
        // Auth tab switching - Remove inline onclick and use proper event listener
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            // Remove inline onclick handler
            tab.removeAttribute('onclick');
            
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabType = tab.getAttribute('data-tab');
                
                console.log('🔄 Auth tab clicked:', tabType);
                
                if (tabType === 'signin') {
                    UIModule.initLoginModal();
                } else if (tabType === 'signup') {
                    UIModule.openSignupModal();
                }
            });
        });
        
        console.log('✅ Auth tab events bound to', authTabs.length, 'tabs');
        
        // ✅ CRITICAL FIX #1: Bind user type selection buttons
        const userTypeCards = document.querySelectorAll('.user-type-card');
        userTypeCards.forEach(card => {
            card.addEventListener('click', () => {
                const userType = card.getAttribute('data-type');
                console.log('🖱️ User type card clicked:', userType);
                
                if (userType) {
                    UIModule.selectUserType(userType);
                } else {
                    console.error('❌ User type not found on card');
                }
            });
        });
        
        console.log('✅ User type selection events bound to', userTypeCards.length, 'cards');
        
        // Back to Step 1 button
        const backBtn = document.querySelector('[onclick="backToStep1()"]');
        if (backBtn) {
            // Remove inline onclick and use proper event listener
            backBtn.removeAttribute('onclick');
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                UIModule.backToStep1();
            });
            
            console.log('✅ Back to Step 1 button event bound');
        }
        
        // ✅ Sign Up form (Step 2) - NEW HANDLER
        const signUpForm = document.getElementById('signUpStep2');
        if (signUpForm) {
            signUpForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('📝 Sign up form submitted');
                
                // 1️⃣ Get form values with validation
                const email = document.getElementById('signUpEmail')?.value?.trim();
                const password = document.getElementById('signUpPassword')?.value;
                const passwordConfirm = document.getElementById('signUpPasswordConfirm')?.value;
                const userType = document.getElementById('selectedUserType')?.value;
                
                console.log('📋 Form data check:');
                console.log('  - Email:', email || '❌ EMPTY');
                console.log('  - Password length:', password?.length || 0);
                console.log('  - User type:', userType || '❌ EMPTY');
                
                // Validate basic fields
                if (!email || !email.includes('@')) {
                    console.error('❌ Invalid email:', email);
                    UIModule.showToast('유효한 이메일을 입력해주세요', 'error');
                    return;
                }
                
                if (!password || password.length < 6) {
                    console.error('❌ Password too short');
                    UIModule.showToast('비밀번호를 6자 이상 입력해주세요', 'error');
                    return;
                }
                
                if (password !== passwordConfirm) {
                    console.error('❌ Passwords do not match');
                    UIModule.showToast('비밀번호가 일치하지 않습니다', 'error');
                    return;
                }
                
                if (!userType || (userType !== 'client' && userType !== 'artist')) {
                    console.error('❌ Invalid user type:', userType);
                    UIModule.showToast('회원 유형을 선택해주세요', 'error');
                    return;
                }
                
                // 2️⃣ Get profile data based on user type
                let profileData = {};
                
                if (userType === 'client') {
                    const name = document.getElementById('clientName')?.value?.trim();
                    const phone = document.getElementById('clientPhone')?.value?.trim();
                    
                    console.log('  - Client name:', name || '❌ EMPTY');
                    console.log('  - Client phone:', phone || '❌ EMPTY');
                    
                    if (!name || !phone) {
                        console.error('❌ Missing client fields');
                        UIModule.showToast('담당자 이름과 연락처를 입력해주세요', 'error');
                        return;
                    }
                    
                    profileData = {
                        name: name,
                        phone: phone,
                        role: 'client'
                    };
                } else if (userType === 'artist') {
                    const stageName = document.getElementById('artistStageName')?.value?.trim();
                    const phone = document.getElementById('artistPhone')?.value?.trim();
                    
                    console.log('  - Artist stage name:', stageName || '❌ EMPTY');
                    console.log('  - Artist phone:', phone || '❌ EMPTY');
                    
                    if (!stageName || !phone) {
                        console.error('❌ Missing artist fields');
                        UIModule.showToast('활동명과 연락처를 입력해주세요', 'error');
                        return;
                    }
                    
                    profileData = {
                        stageName: stageName,
                        phone: phone,
                        role: 'artist'
                    };
                }
                
                console.log('✅ All form validation passed');
                console.log('📤 Calling signUp with:', { email, userType, profileData });
                
                // 3️⃣ Call signUp function
                if (typeof window.signUp === 'function') {
                    try {
                        const result = await window.signUp(email, password, userType, profileData);
                        
                        console.log('📥 Sign up result:', result);
                        
                        // 4️⃣ CRITICAL: Only show success if no error
                        if (result.success && !result.error) {
                            console.log('✅ Sign up successful!');
                            
                            // Close modal after short delay
                            setTimeout(() => {
                                UIModule.closeModal('loginModal');
                                
                                // Reload after 1 second
                                setTimeout(() => {
                                    location.reload();
                                }, 1000);
                            }, 1500);
                        } else {
                            // Show error from Supabase
                            console.error('❌ Sign up failed:', result.error);
                            
                            if (result.error?.message) {
                                UIModule.showToast('가입 실패: ' + result.error.message, 'error');
                            } else {
                                UIModule.showToast('회원가입에 실패했습니다', 'error');
                            }
                        }
                    } catch (error) {
                        console.error('❌ Sign up exception:', error);
                        UIModule.showToast('회원가입 중 오류가 발생했습니다', 'error');
                    }
                } else {
                    console.error('❌ signUp function not available');
                    UIModule.showToast('인증 시스템을 사용할 수 없습니다', 'error');
                }
            });
            
            console.log('✅ Sign Up form event bound (NEW HANDLER)');
        }
    },
    
    // Bind modal events
    bindModalEvents() {
        // Close button events
        const closeButtons = document.querySelectorAll('.modal-close, .close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                UIModule.closeAllModals();
            });
        });
        
        // Click outside modal to close
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    UIModule.closeAllModals();
                }
            });
        });
        
        console.log('✅ Modal close events bound');
    },
    
    // Bind CTA button events
    bindCTAEvents() {
        // Casting CTA
        const castingCTA = document.querySelector('[data-modal="casting"]');
        if (castingCTA) {
            castingCTA.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (!AuthModule.isLoggedIn()) {
                    UIModule.showToast('로그인이 필요한 서비스입니다', 'info');
                    UIModule.openModal('loginModal');
                } else {
                    UIModule.openModal('castingModal');
                }
            });
            
            console.log('✅ Casting CTA event bound');
        }
        
        // Artist CTA
        const artistCTA = document.querySelector('[data-modal="artist"]');
        if (artistCTA) {
            artistCTA.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (!AuthModule.isLoggedIn()) {
                    UIModule.showToast('로그인이 필요한 서비스입니다', 'info');
                    UIModule.openModal('loginModal');
                } else {
                    UIModule.openModal('artistModal');
                }
            });
            
            console.log('✅ Artist CTA event bound');
        }
    },
    
    // Bind dropdown menu events
    bindDropdownEvents() {
        // Dashboard button
        const btnDashboard = document.getElementById('btnDashboard');
        if (btnDashboard) {
            btnDashboard.addEventListener('click', (e) => {
                e.preventDefault();
                UIModule.closeAllDropdowns();
                
                const role = AppState.userRole || 'client';
                if (role === 'artist') {
                    window.location.href = 'artist-dashboard.html';
                } else {
                    window.location.href = 'client-dashboard.html';
                }
            });
        }
        
        // My Profile button
        const btnMyProfile = document.getElementById('btnMyProfile');
        if (btnMyProfile) {
            btnMyProfile.addEventListener('click', (e) => {
                e.preventDefault();
                UIModule.closeAllDropdowns();
                UIModule.showToast('내 정보 페이지는 준비 중입니다', 'info');
            });
        }
        
        // Purchase History button
        const btnPurchaseHistory = document.getElementById('btnPurchaseHistory');
        if (btnPurchaseHistory) {
            btnPurchaseHistory.addEventListener('click', (e) => {
                e.preventDefault();
                UIModule.closeAllDropdowns();
                UIModule.showToast('구매 내역 페이지는 준비 중입니다', 'info');
            });
        }
        
        // Unlocked Dancers button
        const btnUnlockedDancers = document.getElementById('btnUnlockedDancers');
        if (btnUnlockedDancers) {
            btnUnlockedDancers.addEventListener('click', (e) => {
                e.preventDefault();
                UIModule.closeAllDropdowns();
                UIModule.showToast('잠금 해제 댄서 페이지는 준비 중입니다', 'info');
            });
        }
        
        // Credit Charge button
        const btnCreditCharge = document.getElementById('btnCreditCharge');
        if (btnCreditCharge) {
            btnCreditCharge.addEventListener('click', (e) => {
                e.preventDefault();
                UIModule.closeAllDropdowns();
                UIModule.openModal('creditChargeModal');
            });
        }
        
        // Logout button
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', async (e) => {
                e.preventDefault();
                UIModule.closeAllDropdowns();
                await AuthModule.handleLogout();
                setTimeout(() => {
                    window.location.href = '/';
                }, 500);
            });
        }
        
        console.log('✅ Dropdown menu events bound');
    },
    
    // Bind dashboard-specific events
    bindDashboardEvents() {
        // This will be used on dashboard pages
        console.log('✅ Dashboard events ready');
    },
    
    // Bind global events
    bindGlobalEvents() {
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.querySelector('.user-menu');
            
            if (userMenu && !userMenu.contains(e.target)) {
                UIModule.closeAllDropdowns();
            }
        });
        
        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UIModule.closeAllModals();
                UIModule.closeAllDropdowns();
            }
        });
        
        console.log('✅ Global events bound');
    }
};

// =====================================
// 5. INITIALIZATION (초기화)
// =====================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 UTOPIA X - Starting initialization (Refactored)...');
    
    try {
        // 1. Initialize UI elements
        UIModule.initElements();
        
        // 2. Check user session FIRST (synchronous sessionStorage check)
        await AuthModule.checkUserSession();
        
        // 3. Initialize event listeners
        EventModule.init();
        
        // 4. Expose global functions for backward compatibility
        window.selectUserType = (type) => UIModule.selectUserType(type);
        window.backToStep1 = () => UIModule.backToStep1();
        window.openModal = (modalId) => UIModule.openModal(modalId);
        window.closeModal = (modalId) => UIModule.closeModal(modalId);
        
        console.log('🎉 All initialization complete! (Refactored)');
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
});

// =====================================
// 6. EXPORT FOR DEBUGGING (디버깅용)
// =====================================
window.AppState = AppState;
window.AuthModule = AuthModule;
window.UIModule = UIModule;
window.EventModule = EventModule;

console.log('✅ UTOPIA X - Main JavaScript (Refactored) loaded');
