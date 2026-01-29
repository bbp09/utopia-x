// =====================================
//  UTOPIA X - Admin Dashboard (완전 재작성)
//  긴급 버그 수정: 드롭다운 + 크레딧 + 로딩 완전 해결
// =====================================

console.log('🚀 Admin Dashboard: Starting initialization...');

// =====================================
// 메인 초기화 함수
// =====================================
async function initDashboard() {
    console.log('🔐 Step 1: Checking authentication...');
    
    try {
        // 1. Supabase 연결 확인
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase not available');
            alert('데이터베이스 연결에 실패했습니다');
            window.location.replace('/');
            return;
        }
        
        // 2. 유저 인증 확인
        const { data: { user }, error: authError } = await window.supabase.auth.getUser();
        
        if (authError || !user) {
            console.error('❌ Not authenticated:', authError);
            alert('로그인이 필요합니다');
            window.location.replace('/');
            return;
        }
        
        console.log('✅ User authenticated:', user.id);
        
        // 3. DB에서 유저 정보 가져오기 (role, credits 포함)
        console.log('📦 Step 2: Fetching user data from DB...');
        
        const { data: userData, error: dbError } = await window.supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (dbError) {
            console.error('❌ Failed to fetch user data:', dbError);
            alert('사용자 정보를 불러올 수 없습니다');
            window.location.replace('/');
            return;
        }
        
        console.log('✅ User data loaded:', userData);
        
        // 4. [핵심] 역할 확인 및 리다이렉트 (히스토리 남기지 않음)
        const userRole = userData.role || 'client';
        console.log('👤 User role:', userRole);
        
        // Admin이 아닌 경우 각자의 대시보드로 리다이렉트
        if (userRole === 'client') {
            console.warn('⚠️ Client user detected - redirecting to client dashboard');
            window.location.replace('client-dashboard.html');
            return;
        }
        
        if (userRole === 'artist' || userRole === 'dancer') {
            console.warn('⚠️ Artist/Dancer user detected - redirecting to artist dashboard');
            window.location.replace('artist-dashboard.html');
            return;
        }
        
        console.log('✅ Admin user confirmed');
        
        // 5. [핵심] UI 업데이트 - 크레딧 동기화
        console.log('🎨 Step 3: Updating UI with user data...');
        
        // 메인 화면 크레딧
        const mainCredit = document.getElementById('credit-amount') || document.querySelector('.credit-display');
        if (mainCredit) {
            mainCredit.innerText = userData.credits || 0;
            console.log('✅ Main credit display updated:', userData.credits);
        }
        
        // 드롭다운 메뉴 크레딧 (여기가 0으로 뜨는 문제 해결)
        const dropdownCredit = document.getElementById('header-user-credits') || document.querySelector('.dropdown-credit-text');
        if (dropdownCredit) {
            dropdownCredit.innerText = (userData.credits || 0);
            console.log('✅ Dropdown credit display updated:', userData.credits);
        }
        
        // 유저 이메일 표시
        const userEmailDisplay = document.getElementById('user-email-display');
        if (userEmailDisplay) {
            userEmailDisplay.textContent = userData.email || user.email;
            console.log('✅ User email displayed');
        }
        
        // 6. [핵심] 드롭다운 이벤트 리스너 재부착 (중복 방지)
        console.log('🎯 Step 4: Binding dropdown events...');
        bindDropdownEvents();
        
        // 7. 통계 로드
        console.log('📊 Step 5: Loading statistics...');
        await loadStatistics();
        
        // 8. 최근 요청 로드
        console.log('📋 Step 6: Loading recent requests...');
        await loadRecentRequests();
        
        // 9. [필수] 로딩 끝, 화면 보여주기
        console.log('✅ Step 7: Hiding loader and showing dashboard...');
        const loader = document.getElementById('global-loader');
        const dashboard = document.getElementById('dashboard-container');
        
        if (loader) {
            loader.style.display = 'none';
        }
        
        if (dashboard) {
            dashboard.style.display = 'block';
        }
        
        console.log('🎉 Dashboard initialization complete!');
        
    } catch (error) {
        console.error('❌ Exception during dashboard initialization:', error);
        alert('대시보드를 불러오는 중 오류가 발생했습니다');
        window.location.replace('/');
    }
}

// =====================================
// 드롭다운 이벤트 바인딩
// =====================================
function bindDropdownEvents() {
    const profileBtn = document.getElementById('profile-dropdown-btn');
    const dropdownMenu = document.getElementById('profile-dropdown-menu');
    const logoutBtn = document.getElementById('btn-logout');
    
    if (!profileBtn || !dropdownMenu) {
        console.error('❌ Dropdown elements not found');
        return;
    }
    
    // 기존 이벤트 제거 후 새로 추가 (중복 방지)
    const newBtn = profileBtn.cloneNode(true);
    profileBtn.parentNode.replaceChild(newBtn, profileBtn);
    
    // 프로필 버튼 클릭 - 드롭다운 토글
    newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('active');
        console.log('✅ Dropdown toggled');
    });
    
    // 화면 아무데나 클릭 시 드롭다운 닫기
    document.addEventListener('click', (e) => {
        if (!newBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('active');
        }
    });
    
    // 로그아웃 버튼
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('🚪 Logging out...');
            
            if (typeof window.supabase !== 'undefined') {
                await window.supabase.auth.signOut();
            }
            
            sessionStorage.clear();
            window.location.replace('index.html');
        });
    }
    
    console.log('✅ Dropdown events bound successfully');
}

// =====================================
// 통계 로드
// =====================================
async function loadStatistics() {
    try {
        if (typeof window.supabase === 'undefined') return;
        
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) return;
        
        // 승인된 요청 수
        const { data: approvedRequests, error: approvedError } = await window.supabase
            .from('requests')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'approved');
        
        if (!approvedError) {
            const approvedCount = document.getElementById('approved-count');
            if (approvedCount) approvedCount.textContent = approvedRequests?.length || 0;
        }
        
        // 대기 중인 요청 수
        const { data: pendingRequests, error: pendingError } = await window.supabase
            .from('requests')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'pending');
        
        if (!pendingError) {
            const pendingCount = document.getElementById('pending-count');
            if (pendingCount) pendingCount.textContent = pendingRequests?.length || 0;
        }
        
        console.log('✅ Statistics loaded');
        
    } catch (error) {
        console.error('❌ Failed to load statistics:', error);
    }
}

// =====================================
// 최근 요청 로드
// =====================================
async function loadRecentRequests() {
    try {
        if (typeof window.supabase === 'undefined') return;
        
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) return;
        
        // 최근 요청 가져오기
        const { data: requests, error } = await window.supabase
            .from('requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) {
            console.error('❌ Failed to load requests:', error);
            return;
        }
        
        const requestsList = document.getElementById('requests-list');
        if (!requestsList) return;
        
        if (!requests || requests.length === 0) {
            requestsList.innerHTML = `
                <p style="text-align: center; color: var(--text-secondary); padding: 40px;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 15px; display: block; opacity: 0.3;"></i>
                    아직 요청이 없습니다
                </p>
            `;
            return;
        }
        
        // 요청 카드 렌더링
        requestsList.innerHTML = requests.map(request => `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-info">
                        <h4>${request.project_type || '프로젝트'}</h4>
                        <p>${request.name || 'N/A'} • ${request.event_date || 'N/A'}</p>
                    </div>
                    <span class="status-badge status-${request.status || 'pending'}">
                        ${request.status === 'pending' ? '대기 중' : request.status === 'approved' ? '승인됨' : '거절됨'}
                    </span>
                </div>
                <p style="color: var(--text-secondary); font-size: 14px; margin-top: 10px;">
                    ${request.message || '메시지 없음'}
                </p>
            </div>
        `).join('');
        
        console.log('✅ Recent requests loaded:', requests.length);
        
    } catch (error) {
        console.error('❌ Failed to load requests:', error);
    }
}

// =====================================
// DOMContentLoaded 이벤트
// =====================================
window.addEventListener('DOMContentLoaded', initDashboard);

console.log('✅ Admin Dashboard script loaded');
