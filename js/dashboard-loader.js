// =====================================
//  UTOPIA X - Dashboard Loader
//  대시보드 로딩 및 권한 체크
// =====================================

(async function() {
    console.log('🔐 Dashboard Loader: Starting authentication check...');
    
    // Check Supabase availability
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase not available');
        alert('데이터베이스 연결에 실패했습니다');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // Get current user
        const { data: { user }, error: authError } = await window.supabase.auth.getUser();
        
        if (authError || !user) {
            console.error('❌ Not authenticated:', authError);
            alert('로그인이 필요합니다');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('✅ User authenticated:', user.id);
        
        // Get user role from users table
        const { data: userData, error: dbError } = await window.supabase
            .from('users')
            .select('role, name, email')
            .eq('id', user.id)
            .single();
        
        if (dbError) {
            console.error('❌ Failed to fetch user role:', dbError);
            alert('사용자 정보를 불러올 수 없습니다');
            window.location.href = 'index.html';
            return;
        }
        
        const userRole = userData?.role || 'client';
        console.log('👤 User role:', userRole);
        
        // Get current page
        const currentPage = window.location.pathname.split('/').pop();
        console.log('📄 Current page:', currentPage);
        
        // Check if user is on correct dashboard
        const isClientPage = currentPage === 'client-dashboard.html';
        const isArtistPage = currentPage === 'artist-dashboard.html';
        
        if (isClientPage && userRole === 'artist') {
            console.warn('⚠️ Artist on client dashboard - redirecting...');
            window.location.replace('artist-dashboard.html'); // Use replace to avoid back button issue
            return;
        }
        
        if (isArtistPage && userRole === 'client') {
            console.warn('⚠️ Client on artist dashboard - redirecting...');
            window.location.replace('client-dashboard.html'); // Use replace to avoid back button issue
            return;
        }
        
        console.log('✅ User on correct dashboard');
        
        // Store user info in sessionStorage
        sessionStorage.setItem('userEmail', userData.email || user.email);
        sessionStorage.setItem('userName', userData.name || '');
        sessionStorage.setItem('userRole', userRole);
        
        // Remove loading state immediately
        document.body.classList.remove('loading');
        
        const overlay = document.getElementById('globalLoadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
            console.log('✅ Loading overlay hidden');
        }
        
        console.log('🎉 Dashboard loaded successfully');
        
    } catch (error) {
        console.error('❌ Exception during dashboard load:', error);
        alert('대시보드를 불러오는 중 오류가 발생했습니다');
        window.location.href = 'index.html';
    }
})();

console.log('✅ Dashboard Loader script loaded');
