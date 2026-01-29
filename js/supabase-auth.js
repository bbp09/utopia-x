// ===================================
//  Supabase Authentication System
// ===================================

// Global auth state
const authState = {
    user: null,
    session: null,
    role: null // 'client' or 'artist'
};

// ===== Initialize Auth System =====
async function initAuth() {
    console.log('🔐 Initializing authentication...');
    
    const client = initSupabase();
    if (!client) {
        console.warn('⚠️ Supabase not configured, using fallback auth');
        return;
    }
    
    // Check for existing session
    const { data: { session }, error } = await client.auth.getSession();
    
    if (error) {
        console.error('❌ Session check error:', error);
        return;
    }
    
    if (session) {
        console.log('✅ User session found');
        await handleAuthSuccess(session);
    } else {
        console.log('👤 No active session');
    }
    
    // Listen for auth state changes
    client.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
            await handleAuthSuccess(session);
        } else if (event === 'SIGNED_OUT') {
            handleSignOut();
        }
    });
}

// ===== Handle Successful Authentication =====
async function handleAuthSuccess(session) {
    authState.user = session.user;
    authState.session = session;
    
    // Get user role from metadata
    authState.role = session.user.user_metadata?.role || 'client';
    
    console.log('👤 User:', authState.user.email);
    console.log('🎭 Role:', authState.role);
    
    // Update UI
    updateUserUI();
    
    // Store in session storage
    sessionStorage.setItem('userEmail', authState.user.email);
    sessionStorage.setItem('userRole', authState.role);
}

// ===== Update User UI =====
function updateUserUI() {
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const creditDisplay = document.getElementById('creditDisplay');
    
    if (userEmailDisplay && authState.user) {
        userEmailDisplay.textContent = authState.user.email;
    }
    
    // Update credit display (mock for now)
    if (creditDisplay) {
        creditDisplay.textContent = '10'; // Default credits
    }
}

// ===== Sign Up =====
async function signUp(email, password, userType, profileData = {}) {
    console.log('📝 Signing up:', email, 'as', userType);
    console.log('📋 Profile data:', JSON.stringify(profileData, null, 2));
    
    // ✅ STEP 1: Validate inputs
    if (!email || !email.includes('@')) {
        console.error('❌ Invalid email:', email);
        showToast('유효한 이메일을 입력해주세요', 'error');
        return { success: false, error: { message: 'Invalid email' } };
    }
    
    if (!password || password.length < 6) {
        console.error('❌ Password too short:', password?.length);
        showToast('비밀번호를 6자 이상 입력해주세요', 'error');
        return { success: false, error: { message: 'Password too short' } };
    }
    
    if (!userType || (userType !== 'client' && userType !== 'artist')) {
        console.error('❌ Invalid user type:', userType);
        showToast('회원 유형을 선택해주세요', 'error');
        return { success: false, error: { message: 'Invalid user type' } };
    }
    
    // ✅ STEP 2: Validate required fields based on user type
    if (userType === 'client') {
        if (!profileData.name || !profileData.phone) {
            console.error('❌ Missing client fields:', { name: profileData.name, phone: profileData.phone });
            showToast('담당자 이름과 연락처를 입력해주세요', 'error');
            return { success: false, error: { message: 'Missing client fields' } };
        }
    } else if (userType === 'artist') {
        if (!profileData.stageName || !profileData.phone) {
            console.error('❌ Missing artist fields:', { stageName: profileData.stageName, phone: profileData.phone });
            showToast('활동명과 연락처를 입력해주세요', 'error');
            return { success: false, error: { message: 'Missing artist fields' } };
        }
    }
    
    console.log('✅ All validation passed, attempting signup...');
    
    const client = initSupabase();
    if (!client) {
        console.warn('⚠️ No Supabase client - using fallback');
        // No Supabase configured - use mock database
        return fallbackSignUp(email, password, userType, profileData);
    }
    
    try {
        // ✅ STEP 3: Prepare user metadata with role info
        const userMetadata = {
            user_type: userType,
            userRole: userType,
            role: userType,  // Add role explicitly
            ...profileData,
            credits: 10, // Initial credits
            createdAt: new Date().toISOString()
        };
        
        console.log('📤 Sending to Supabase with metadata:', JSON.stringify(userMetadata, null, 2));
        
        const { data, error } = await client.auth.signUp({
            email: email,
            password: password,
            options: {
                data: userMetadata
            }
        });
        
        // ✅ STEP 4: CRITICAL - Check for errors FIRST
        if (error) {
            console.error('❌ Supabase sign up error:', error);
            console.error('  - Error message:', error.message);
            console.error('  - Error code:', error.code);
            console.error('  - Error status:', error.status);
            
            // Handle specific error messages
            if (error.message.includes('already registered') || error.message.includes('already been registered')) {
                showToast('이미 가입된 이메일입니다', 'error');
            } else if (error.message.includes('Invalid email')) {
                showToast('유효하지 않은 이메일 형식입니다', 'error');
            } else if (error.message.includes('Password')) {
                showToast('비밀번호가 요구사항을 충족하지 않습니다', 'error');
            } else {
                showToast('회원가입 실패: ' + error.message, 'error');
            }
            
            return { success: false, error };
        }
        
        // ✅ STEP 5: Verify data is returned
        if (!data || !data.user) {
            console.error('❌ No user data returned from Supabase:', data);
            showToast('회원가입 처리 중 오류가 발생했습니다', 'error');
            return { success: false, error: { message: 'No user data returned' } };
        }
        
        console.log('✅ Sign up successful!');
        console.log('📥 User data:', {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata
        });
        
        // ✅ STEP 6: Store in sessionStorage for immediate access
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userType', userType);
        sessionStorage.setItem('userRole', userType);
        sessionStorage.setItem('userProfile', JSON.stringify(profileData));
        
        showToast('🎉 회원가입 성공! 10 크레딧이 지급되었습니다.', 'success');
        
        return { success: true, data, userType };
    } catch (error) {
        console.error('❌ Sign up exception:', error);
        console.error('  - Exception message:', error.message);
        console.error('  - Exception stack:', error.stack);
        showToast('회원가입 중 오류가 발생했습니다', 'error');
        return { success: false, error };
    }
}

// ===== Fallback Sign Up (Without Supabase) =====
function fallbackSignUp(email, password, userType, profileData = {}) {
    console.log('⚠️ Using fallback sign up (Demo mode)');
    console.log('📋 Fallback data:', { email, userType, profileData });
    
    // Get mock users from localStorage
    const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    
    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
        console.error('❌ Email already exists in mock database');
        showToast('이미 가입된 이메일입니다', 'error');
        return { success: false, error: { message: 'Email already exists' } };
    }
    
    // Add new user with full profile
    const newUser = {
        id: 'mock_' + Date.now(),
        email: email,
        password: password,
        user_type: userType,
        userRole: userType,
        role: userType,
        ...profileData,
        credits: 10,
        createdAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    console.log('✅ New user added to mock database:', {
        id: newUser.id,
        email: newUser.email,
        userType: newUser.user_type
    });
    
    // Save to localStorage
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    
    // Store in sessionStorage for immediate access
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userType', userType);
    sessionStorage.setItem('userRole', userType);
    sessionStorage.setItem('userProfile', JSON.stringify(profileData));
    
    console.log('✅ Mock user created:', email);
    showToast('🎉 회원가입 성공! 10 크레딧이 지급되었습니다. (데모 모드)', 'success');
    
    return { success: true, userType };
}

// ===== Sign In =====
async function signIn(email, password) {
    console.log('🔓 Signing in:', email);
    
    // Validate inputs
    if (!email || !email.includes('@')) {
        showToast('유효한 이메일을 입력해주세요', 'error');
        return { success: false };
    }
    
    if (!password || password.length < 6) {
        showToast('비밀번호를 6자 이상 입력해주세요', 'error');
        return { success: false };
    }
    
    const client = initSupabase();
    if (!client) {
        // No Supabase configured - use mock validation
        return fallbackSignIn(email, password);
    }
    
    try {
        const { data, error } = await client.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('❌ Sign in error:', error);
            
            // Handle specific error messages
            if (error.message.includes('Invalid login credentials')) {
                showToast('이메일 또는 비밀번호가 일치하지 않습니다', 'error');
            } else if (error.message.includes('Email not confirmed')) {
                showToast('이메일 인증이 필요합니다', 'error');
            } else {
                showToast(error.message, 'error');
            }
            
            return { success: false, error };
        }
        
        console.log('✅ Sign in successful');
        showToast('로그인 성공!', 'success');
        
        // Stay on home page - just refresh
        if (typeof closeModal === 'function') {
            closeModal('loginModal');
        }
        setTimeout(() => {
            location.reload();
        }, 500);
        
        return { success: true, data };
    } catch (error) {
        console.error('❌ Sign in exception:', error);
        showToast('로그인 중 오류가 발생했습니다', 'error');
        return { success: false, error };
    }
}

// ===== Fallback Sign In (Without Supabase) =====
function fallbackSignIn(email, password) {
    console.log('⚠️ Using fallback sign in (Demo mode)');
    
    // Simple validation
    if (!email || !email.includes('@')) {
        showToast('유효한 이메일을 입력해주세요', 'error');
        return { success: false };
    }
    
    if (!password || password.length < 6) {
        showToast('비밀번호를 6자 이상 입력해주세요', 'error');
        return { success: false };
    }
    
    // Mock user database (for demo)
    const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    
    // Check if user exists
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
        showToast('가입되지 않은 이메일입니다', 'error');
        return { success: false };
    }
    
    // Check password
    if (user.password !== password) {
        showToast('비밀번호가 일치하지 않습니다', 'error');
        return { success: false };
    }
    
    // Mock authentication success
    authState.user = { email: email };
    authState.role = user.role || 'client';
    
    // Update UI
    updateUserUI();
    
    // Store in session
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userRole', user.role || 'client');
    
    showToast('로그인 성공! (데모 모드)', 'success');
    
    // Close modal
    if (typeof closeModal === 'function') {
        closeModal('loginModal');
    }
    
    // Stay on home page - just refresh
    setTimeout(() => {
        location.reload();
    }, 500);
    
    return { success: true };
}

// ===== Sign Out =====
async function signOut() {
    console.log('👋 Signing out...');
    
    const client = initSupabase();
    if (client) {
        await client.auth.signOut();
    }
    
    handleSignOut();
}

function handleSignOut() {
    // Clear auth state
    authState.user = null;
    authState.session = null;
    authState.role = null;
    
    // Clear session storage
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userRole');
    
    // Update UI
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    if (userEmailDisplay) {
        userEmailDisplay.textContent = 'Login';
    }
    
    // Redirect to home
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        window.location.href = '/';
    }
    
    showToast('로그아웃되었습니다', 'success');
}

// ===== Redirect to Dashboard =====
function redirectToDashboard() {
    const role = authState.role || sessionStorage.getItem('userRole') || 'client';
    
    if (role === 'artist') {
        window.location.href = 'artist-dashboard.html';
    } else {
        window.location.href = 'client-dashboard.html';
    }
}

// ===== Check Auth for Protected Pages =====
function requireAuth() {
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (!userEmail) {
        console.log('⚠️ Auth required, redirecting to home');
        showToast('로그인이 필요합니다', 'info');
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
        return false;
    }
    
    return true;
}

// ===== Get Current User =====
function getCurrentUser() {
    if (authState.user) {
        return authState.user;
    }
    
    // Fallback to session storage
    const email = sessionStorage.getItem('userEmail');
    const role = sessionStorage.getItem('userRole');
    
    if (email) {
        return { email, role };
    }
    
    return null;
}
