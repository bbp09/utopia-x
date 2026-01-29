// ===================================
//  UTOPIA X - Admin Dashboard JS
// ===================================

// Admin Config
const ADMIN_PASSWORD = 'admin123'; // ⚠️ 개발용 비밀번호 (배포 전 변경 필요)
const ADMIN_SESSION_KEY = 'utopiax_admin_session';

// Global State
const adminState = {
    dancers: [],
    castingRequests: [],
    artistApplications: [],
    featuredDancers: [],
    isLoggedIn: false
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    checkAdminSession();
    initLoginForm();
    initNavigation();
    initClock();
});

// ===== Authentication =====
function checkAdminSession() {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (session === 'active') {
        showDashboard();
        loadAllData();
    } else {
        showLoginScreen();
    }
}

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem(ADMIN_SESSION_KEY, 'active');
        adminState.isLoggedIn = true;
        showDashboard();
        loadAllData();
        showToast('로그인 성공!', 'success');
    } else {
        showToast('비밀번호가 올바르지 않습니다.', 'error');
        document.getElementById('adminPassword').value = '';
    }
}

function handleLogout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    adminState.isLoggedIn = false;
    showLoginScreen();
    showToast('로그아웃되었습니다.', 'success');
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
}

// Initialize logout button
setTimeout(() => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}, 100);

// ===== Navigation =====
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update header title
    const titles = {
        'dashboard': ['대시보드', '전체 현황을 한눈에 확인하세요'],
        'casting-requests': ['섭외 요청', '클라이언트 섭외 요청을 관리하세요'],
        'artist-applications': ['아티스트 신청', '신규 아티스트 등록 신청을 검토하세요'],
        'featured-dancers': ['빠른섭외 관리', '메인 페이지 빠른섭외 리스트를 관리하세요'],
        'dancers-db': ['댄서 DB', '전체 댄서 데이터베이스를 관리하세요']
    };
    
    const [title, subtitle] = titles[sectionName] || ['대시보드', ''];
    document.getElementById('sectionTitle').textContent = title;
    document.getElementById('sectionSubtitle').textContent = subtitle;
    
    // Load data for specific sections
    if (sectionName === 'casting-requests') {
        loadCastingRequests();
    } else if (sectionName === 'artist-applications') {
        loadArtistApplications();
    } else if (sectionName === 'featured-dancers') {
        loadFeaturedDancersManagement();
    } else if (sectionName === 'dancers-db') {
        loadDancersDB();
    }
}

// ===== Clock =====
function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const clockEl = document.getElementById('currentTime');
    if (clockEl) {
        clockEl.textContent = timeString;
    }
}

// ===== Load All Data =====
async function loadAllData() {
    try {
        await Promise.all([
            loadDancersData(),
            loadCastingRequestsData(),
            loadArtistApplicationsData()
        ]);
        
        updateDashboardStats();
        renderRecentActivity();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('데이터 로딩 중 오류가 발생했습니다.', 'error');
    }
}

async function loadDancersData() {
    try {
        const response = await fetch('tables/dancers?limit=100');
        if (response.ok) {
            const result = await response.json();
            adminState.dancers = result.data || [];
        }
    } catch (error) {
        console.error('Error loading dancers:', error);
    }
}

async function loadCastingRequestsData() {
    try {
        const response = await fetch('tables/casting_requests?limit=100');
        if (response.ok) {
            const result = await response.json();
            adminState.castingRequests = result.data || [];
        }
    } catch (error) {
        console.error('Error loading casting requests:', error);
    }
}

async function loadArtistApplicationsData() {
    try {
        const response = await fetch('tables/artist_registrations?limit=100');
        if (response.ok) {
            const result = await response.json();
            adminState.artistApplications = result.data || [];
        }
    } catch (error) {
        console.error('Error loading artist applications:', error);
    }
}

// ===== Dashboard Stats =====
function updateDashboardStats() {
    // Total Dancers
    document.getElementById('totalDancers').textContent = adminState.dancers.length;
    document.getElementById('dancersCountBadge').textContent = adminState.dancers.length;
    
    // Total Casting Requests
    document.getElementById('totalCastingRequests').textContent = adminState.castingRequests.length;
    document.getElementById('castingRequestsBadge').textContent = adminState.castingRequests.length;
    
    // Pending Applications
    const pendingCount = adminState.artistApplications.filter(app => !app.approved && !app.rejected).length;
    document.getElementById('pendingApplications').textContent = pendingCount;
    document.getElementById('pendingApplicationsBadge').textContent = pendingCount;
}

// ===== Recent Activity =====
function renderRecentActivity() {
    const activityList = document.getElementById('recentActivityList');
    if (!activityList) return;
    
    // Combine all recent activities
    const activities = [];
    
    // Recent casting requests
    adminState.castingRequests.slice(0, 3).forEach(req => {
        activities.push({
            type: 'casting',
            icon: 'user-check',
            iconClass: 'new',
            title: `새 섭외 요청: ${req.client_name}`,
            time: formatTimeAgo(req.created_at),
            timestamp: req.created_at
        });
    });
    
    // Recent applications
    adminState.artistApplications.slice(0, 3).forEach(app => {
        activities.push({
            type: 'application',
            icon: 'user-plus',
            iconClass: 'pending',
            title: `아티스트 등록: ${app.name}`,
            time: formatTimeAgo(app.created_at),
            timestamp: app.created_at
        });
    });
    
    // Sort by timestamp
    activities.sort((a, b) => b.timestamp - a.timestamp);
    
    // Render
    activityList.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.iconClass}">
                <i class="fas fa-${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p class="activity-title">${activity.title}</p>
                <p class="activity-time">${activity.time}</p>
            </div>
        </div>
    `).join('');
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return '방금 전';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
}

// ===== Casting Requests (C) =====
async function loadCastingRequests() {
    await loadCastingRequestsData();
    renderCastingRequests();
}

function renderCastingRequests() {
    const grid = document.getElementById('castingRequestsGrid');
    if (!grid) return;
    
    if (adminState.castingRequests.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">섭외 요청이 없습니다.</p>';
        return;
    }
    
    grid.innerHTML = adminState.castingRequests.map(request => `
        <div class="casting-card" onclick="viewCastingDetail('${request.id}')">
            <span class="card-status new">새 요청</span>
            <h4>${request.client_name}</h4>
            <p><i class="fas fa-envelope"></i> ${request.client_email}</p>
            <p><i class="fas fa-phone"></i> ${request.client_phone}</p>
            <p><i class="fas fa-calendar"></i> ${request.event_date}</p>
            <p><i class="fas fa-briefcase"></i> ${request.event_type}</p>
            <p><i class="fas fa-users"></i> 댄서 ${request.dancer_count}명</p>
            <p><i class="fas fa-won-sign"></i> ${formatCurrency(request.budget)}</p>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color);">
                <p style="font-size: 12px; color: var(--text-secondary);">
                    <i class="fas fa-robot"></i> AI 프롬프트: ${truncateText(request.ai_prompt, 50)}
                </p>
            </div>
        </div>
    `).join('');
}

function viewCastingDetail(id) {
    const request = adminState.castingRequests.find(r => r.id === id);
    if (!request) return;
    
    const modal = document.getElementById('castingDetailModal');
    const content = document.getElementById('castingDetailContent');
    
    let analyzedTags = {};
    try {
        analyzedTags = JSON.parse(request.analyzed_tags || '{}');
    } catch (e) {
        console.error('Failed to parse analyzed_tags:', e);
    }
    
    content.innerHTML = `
        <h2>섭외 요청 상세</h2>
        <div style="margin-top: 30px;">
            <h3>클라이언트 정보</h3>
            <p><strong>이름:</strong> ${request.client_name}</p>
            <p><strong>이메일:</strong> ${request.client_email}</p>
            <p><strong>연락처:</strong> ${request.client_phone}</p>
            <p><strong>행사 날짜:</strong> ${request.event_date}</p>
            <p><strong>행사 유형:</strong> ${request.event_type}</p>
            <p><strong>필요 댄서:</strong> ${request.dancer_count}명</p>
            <p><strong>예산:</strong> ${formatCurrency(request.budget)}</p>
            
            <h3 style="margin-top: 30px;">AI 분석 결과</h3>
            <p><strong>요청 내용:</strong></p>
            <p style="background: var(--bg-dark-secondary); padding: 15px; border-radius: 8px; white-space: pre-wrap;">${request.ai_prompt}</p>
            
            ${analyzedTags.hardFilters ? `
                <h4 style="margin-top: 20px;">Hard Filters (필수 조건)</h4>
                <pre style="background: var(--bg-dark-secondary); padding: 15px; border-radius: 8px; overflow-x: auto;">${JSON.stringify(analyzedTags.hardFilters, null, 2)}</pre>
            ` : ''}
            
            ${analyzedTags.softScores ? `
                <h4 style="margin-top: 20px;">Soft Scores (가중치)</h4>
                <pre style="background: var(--bg-dark-secondary); padding: 15px; border-radius: 8px; overflow-x: auto;">${JSON.stringify(analyzedTags.softScores, null, 2)}</pre>
            ` : ''}
            
            ${request.message ? `
                <h3 style="margin-top: 30px;">추가 메시지</h3>
                <p style="background: var(--bg-dark-secondary); padding: 15px; border-radius: 8px;">${request.message}</p>
            ` : ''}
        </div>
    `;
    
    modal.classList.add('active');
}

// ===== Artist Applications (A) =====
async function loadArtistApplications() {
    await loadArtistApplicationsData();
    renderArtistApplications();
}

function renderArtistApplications() {
    const grid = document.getElementById('artistApplicationsGrid');
    if (!grid) return;
    
    if (adminState.artistApplications.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">아티스트 등록 신청이 없습니다.</p>';
        return;
    }
    
    grid.innerHTML = adminState.artistApplications.map(app => {
        const status = app.approved ? 'approved' : (app.rejected ? 'rejected' : 'pending');
        const statusText = app.approved ? '승인됨' : (app.rejected ? '거부됨' : '대기중');
        
        return `
            <div class="application-card" onclick="viewApplicationDetail('${app.id}')">
                <span class="card-status ${status}">${statusText}</span>
                <h4>${app.name}</h4>
                <p><i class="fas fa-envelope"></i> ${app.email}</p>
                <p><i class="fas fa-phone"></i> ${app.phone}</p>
                <p><i class="fas fa-music"></i> ${app.specialty}</p>
                ${app.gender ? `<p><i class="fas fa-venus-mars"></i> ${app.gender}</p>` : ''}
                ${app.heightCm ? `<p><i class="fas fa-ruler-vertical"></i> ${app.heightCm}cm</p>` : ''}
                <p><i class="fas fa-won-sign"></i> 희망 단가: ${formatCurrency(app.desiredPrice)}</p>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color);">
                    ${status === 'pending' ? `
                        <button class="btn-primary" style="width: 100%; margin-bottom: 10px;" onclick="event.stopPropagation(); approveApplication('${app.id}')">
                            <i class="fas fa-check"></i> 승인
                        </button>
                        <button class="btn-secondary" style="width: 100%;" onclick="event.stopPropagation(); rejectApplication('${app.id}')">
                            <i class="fas fa-times"></i> 거부
                        </button>
                    ` : `
                        <p style="font-size: 12px; color: var(--text-secondary);">
                            ${formatTimeAgo(app.created_at)}
                        </p>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function viewApplicationDetail(id) {
    const app = adminState.artistApplications.find(a => a.id === id);
    if (!app) return;
    
    const modal = document.getElementById('applicationDetailModal');
    const content = document.getElementById('applicationDetailContent');
    
    const status = app.approved ? 'approved' : (app.rejected ? 'rejected' : 'pending');
    const statusText = app.approved ? '승인됨' : (app.rejected ? '거부됨' : '대기중');
    
    content.innerHTML = `
        <h2>아티스트 등록 신청 상세</h2>
        <span class="card-status ${status}">${statusText}</span>
        
        <div style="margin-top: 30px;">
            <h3>기본 정보</h3>
            <p><strong>이름:</strong> ${app.name}</p>
            <p><strong>이메일:</strong> ${app.email}</p>
            <p><strong>연락처:</strong> ${app.phone}</p>
            <p><strong>전문 장르:</strong> ${app.specialty}</p>
            <p><strong>희망 단가:</strong> ${formatCurrency(app.desiredPrice)}</p>
            ${app.videoLink ? `<p><strong>영상 링크:</strong> <a href="${app.videoLink}" target="_blank" style="color: var(--primary-purple);">${app.videoLink}</a></p>` : ''}
            
            ${app.gender || app.heightCm || app.bodyFrame || app.skinTone ? `
                <h3 style="margin-top: 30px;">비주얼 프로필</h3>
                ${app.gender ? `<p><strong>성별:</strong> ${app.gender}</p>` : ''}
                ${app.heightCm ? `<p><strong>키:</strong> ${app.heightCm}cm</p>` : ''}
                ${app.bodyFrame ? `<p><strong>체형:</strong> ${app.bodyFrame}</p>` : ''}
                ${app.skinTone ? `<p><strong>피부톤:</strong> ${app.skinTone}</p>` : ''}
                ${app.hairStyle ? `<p><strong>헤어 스타일:</strong> ${app.hairStyle}</p>` : ''}
                ${app.hairColor ? `<p><strong>헤어 컬러:</strong> ${app.hairColor}</p>` : ''}
            ` : ''}
            
            ${app.acting || app.singing ? `
                <h3 style="margin-top: 30px;">스킬</h3>
                ${app.acting ? `<p><strong>연기력:</strong> ${app.acting}/100</p>` : ''}
                ${app.emotionalActing ? `<p><strong>감정 연기:</strong> ${app.emotionalActing}/100</p>` : ''}
                ${app.singing ? `<p><strong>가창력:</strong> ${app.singing}/100</p>` : ''}
                ${app.rhythmAccuracy ? `<p><strong>박자감:</strong> ${app.rhythmAccuracy}/100</p>` : ''}
            ` : ''}
            
            ${app.kidsFriendly || app.sfxMakeupOk ? `
                <h3 style="margin-top: 30px;">특수 태그</h3>
                ${app.kidsFriendly ? `<p>✅ 어린이 친화</p>` : ''}
                ${app.sfxMakeupOk ? `<p>✅ 특수분장 가능</p>` : ''}
                ${app.cosplayExperience ? `<p>✅ 코스프레 경험</p>` : ''}
                ${app.horrorReady ? `<p>✅ 호러 연출 가능</p>` : ''}
            ` : ''}
        </div>
        
        ${status === 'pending' ? `
            <div style="display: flex; gap: 10px; margin-top: 30px;">
                <button class="btn-primary" style="flex: 1;" onclick="approveApplication('${app.id}'); closeModal('applicationDetailModal');">
                    <i class="fas fa-check"></i> 승인
                </button>
                <button class="btn-secondary" style="flex: 1;" onclick="rejectApplication('${app.id}'); closeModal('applicationDetailModal');">
                    <i class="fas fa-times"></i> 거부
                </button>
            </div>
        ` : ''}
    `;
    
    modal.classList.add('active');
}

async function approveApplication(id) {
    try {
        // TODO: Update application status to approved
        // For now, just show toast
        showToast('아티스트 승인 기능은 추후 구현 예정입니다.', 'warning');
        
        // Reload data
        await loadArtistApplications();
    } catch (error) {
        console.error('Error approving application:', error);
        showToast('승인 중 오류가 발생했습니다.', 'error');
    }
}

async function rejectApplication(id) {
    if (!confirm('정말 이 신청을 거부하시겠습니까?')) return;
    
    try {
        // TODO: Update application status to rejected
        showToast('아티스트 거부 기능은 추후 구현 예정입니다.', 'warning');
        
        // Reload data
        await loadArtistApplications();
    } catch (error) {
        console.error('Error rejecting application:', error);
        showToast('거부 중 오류가 발생했습니다.', 'error');
    }
}

// ===== Featured Dancers Management (B) =====
function loadFeaturedDancersManagement() {
    // TODO: Implement drag & drop management
    showToast('빠른섭외 관리 기능은 추후 구현 예정입니다.', 'warning');
}

// ===== Dancers DB (D) =====
async function loadDancersDB() {
    await loadDancersData();
    renderDancersDB();
}

function renderDancersDB() {
    const grid = document.getElementById('dancersDBGrid');
    if (!grid) return;
    
    if (adminState.dancers.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">댄서 데이터가 없습니다.</p>';
        return;
    }
    
    grid.innerHTML = adminState.dancers.map(dancer => `
        <div class="dancer-card" onclick="viewDancerDetail('${dancer.id}')">
            <img src="${dancer.image_url}" alt="${dancer.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 15px;">
            <h4>${dancer.name}</h4>
            <p style="color: var(--text-secondary); font-size: 12px;">${dancer.name_en}</p>
            <p><i class="fas fa-music"></i> ${dancer.specialty}</p>
            <p><i class="fas fa-users"></i> ${dancer.team_size === 1 ? '솔로' : '팀 ' + dancer.team_size + '명'}</p>
            <p><i class="fas fa-star"></i> ${dancer.rating}/5.0</p>
        </div>
    `).join('');
}

// ===== Utilities =====
function formatCurrency(amount) {
    if (!amount) return '0원';
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ===== Toast Notification =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('adminToast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `admin-toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
