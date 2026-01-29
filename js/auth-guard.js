// =====================================
//  UTOPIA X - Auth Guard
//  페이지별 권한 체크 및 즉시 리다이렉트
// =====================================

(async function authGuard() {
    console.log('🛡️ Auth Guard: Starting security check...');
    
    // 1. Supabase 연결 확인
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase not available');
        alert('데이터베이스 연결에 실패했습니다');
        window.location.replace('index.html');
        return;
    }
    
    try {
        // 2. 유저 인증 확인
        const { data: { user }, error: authError } = await window.supabase.auth.getUser();
        
        if (authError || !user) {
            console.error('❌ Not authenticated:', authError);
            alert('로그인이 필요합니다');
            window.location.replace('index.html');
            return;
        }
        
        console.log('✅ User authenticated:', user.id);
        
        // 3. 유저 역할 조회
        const { data: userData, error: dbError } = await window.supabase
            .from('users')
            .select('role, name, email')
            .eq('id', user.id)
            .single();
        
        if (dbError) {
            console.error('❌ Failed to fetch user role:', dbError);
            alert('사용자 정보를 불러올 수 없습니다');
            window.location.replace('index.html');
            return;
        }
        
        const userRole = userData?.role || 'client';
        console.log('👤 User role:', userRole);
        
        // 4. 현재 페이지 확인
        const currentPage = window.location.pathname.split('/').pop();
        console.log('📄 Current page:', currentPage);
        
        // 5. 역할별 페이지 접근 제어
        const isClientPage = currentPage.startsWith('client-');
        const isArtistPage = currentPage.startsWith('artist-');
        
        // 클라이언트가 아티스트 페이지에 접속
        if (isArtistPage && userRole === 'client') {
            console.warn('⚠️ Client trying to access artist page - redirecting...');
            window.location.replace('client-dashboard.html');
            return;
        }
        
        // 아티스트가 클라이언트 페이지에 접속
        if (isClientPage && (userRole === 'artist' || userRole === 'dancer')) {
            console.warn('⚠️ Artist trying to access client page - redirecting...');
            window.location.replace('artist-dashboard.html');
            return;
        }
        
        console.log('✅ Access granted to', currentPage);
        
        // 6. SessionStorage에 유저 정보 저장
        sessionStorage.setItem('userId', user.id);
        sessionStorage.setItem('userEmail', userData.email || user.email);
        sessionStorage.setItem('userName', userData.name || '');
        sessionStorage.setItem('userRole', userRole);
        
        console.log('🎉 Auth Guard: Security check passed!');
        
    } catch (error) {
        console.error('❌ Exception during auth guard:', error);
        alert('권한 확인 중 오류가 발생했습니다');
        window.location.replace('index.html');
    }
})();

console.log('✅ Auth Guard script loaded');
