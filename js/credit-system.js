// ===================================
//  UTOPIA X - Credit System & User Auth
// ===================================

// ===== User Session Management =====
async function checkUserSession() {
    const userEmail = localStorage.getItem('utopiax_user_email');
    
    if (userEmail) {
        // Load user from database
        try {
            const response = await fetch(`tables/users?search=${encodeURIComponent(userEmail)}&limit=1`);
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                state.currentUser = data.data[0];
                updateUserUI();
                console.log('✅ User session restored:', state.currentUser.email);
            } else {
                // User not found, clear session
                localStorage.removeItem('utopiax_user_email');
                state.currentUser = null;
                updateUserUI();
            }
        } catch (error) {
            console.error('❌ Error loading user:', error);
            state.currentUser = null;
            updateUserUI();
        }
    } else {
        // No session - show as Guest
        state.currentUser = null;
        updateUserUI();
    }
}

async function loginOrRegister(email) {
    try {
        // Check if user exists
        const response = await fetch(`tables/users?search=${encodeURIComponent(email)}&limit=1`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            // Existing user - login
            state.currentUser = data.data[0];
            
            // Update last login
            await fetch(`tables/users/${state.currentUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lastLogin: Date.now() })
            });
            
            console.log('✅ Login successful:', email);
        } else {
            // New user - register with 10 free credits
            const newUser = {
                email: email,
                credits: 10,
                usedDancers: [],
                purchaseHistory: [],
                createdAt: Date.now(),
                lastLogin: Date.now()
            };
            
            const createResponse = await fetch('tables/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            
            state.currentUser = await createResponse.json();
            
            console.log('✅ New user registered:', email, '- 10 free credits!');
            showToast('🎉 회원가입 완료! 10 크레딧이 지급되었습니다', 'success');
        }
        
        // Save to localStorage
        localStorage.setItem('utopiax_user_email', email);
        
        // Update UI
        updateUserUI();
        closeModal('loginModal');
        
    } catch (error) {
        console.error('❌ Error during login/register:', error);
        showToast('로그인 중 오류가 발생했습니다', 'error');
    }
}

function logout() {
    localStorage.removeItem('utopiax_user_email');
    state.currentUser = null;
    updateUserUI();
    showToast('로그아웃되었습니다', 'info');
    
    // Close dropdown
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenuDropdown = document.getElementById('userMenuDropdown');
    if (userMenuBtn) userMenuBtn.classList.remove('active');
    if (userMenuDropdown) userMenuDropdown.classList.remove('show');
}

function updateUserUI() {
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const creditDisplay = document.getElementById('creditDisplay');
    const userMenuBtn = document.getElementById('userMenuBtn');
    
    if (state.currentUser) {
        userEmailDisplay.textContent = state.currentUser.email.split('@')[0];
        creditDisplay.textContent = state.currentUser.credits || 0;
        
        // Show user icon
        const icon = userMenuBtn.querySelector('.fa-user-circle');
        if (icon) icon.style.display = 'inline';
        const signInIcon = userMenuBtn.querySelector('.fa-sign-in-alt');
        if (signInIcon) signInIcon.style.display = 'none';
    } else {
        userEmailDisplay.textContent = '로그인';
        creditDisplay.textContent = '0';
        
        // Show sign-in icon
        const icon = userMenuBtn.querySelector('.fa-user-circle');
        if (icon) icon.style.display = 'none';
        const signInIcon = userMenuBtn.querySelector('.fa-sign-in-alt');
        if (signInIcon) {
            signInIcon.style.display = 'inline';
        } else {
            // Add sign-in icon if not exists
            const newIcon = document.createElement('i');
            newIcon.className = 'fas fa-sign-in-alt';
            userMenuBtn.insertBefore(newIcon, userMenuBtn.firstChild);
        }
    }
}

// ===== User Menu Dropdown =====
function initUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenuDropdown = document.getElementById('userMenuDropdown');
    const btnCreditCharge = document.getElementById('btnCreditCharge');
    const btnMyProfile = document.getElementById('btnMyProfile');
    const btnPurchaseHistory = document.getElementById('btnPurchaseHistory');
    const btnUnlockedDancers = document.getElementById('btnUnlockedDancers');
    const btnLogout = document.getElementById('btnLogout');
    
    // Toggle dropdown
    userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Check if user is logged in
        if (!state.currentUser) {
            showToast('먼저 로그인해주세요', 'info');
            openModal('login');
            return;
        }
        
        userMenuBtn.classList.toggle('active');
        userMenuDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !userMenuDropdown.contains(e.target)) {
            userMenuBtn.classList.remove('active');
            userMenuDropdown.classList.remove('show');
        }
    });
    
    // Credit charge button
    btnCreditCharge.addEventListener('click', (e) => {
        e.preventDefault();
        if (!state.currentUser) {
            showToast('먼저 로그인해주세요', 'info');
            openModal('login');
            return;
        }
        openModal('creditCharge');
        userMenuBtn.classList.remove('active');
        userMenuDropdown.classList.remove('show');
    });
    
    // My Profile button
    btnMyProfile.addEventListener('click', (e) => {
        e.preventDefault();
        showMyProfile();
        userMenuBtn.classList.remove('active');
        userMenuDropdown.classList.remove('show');
    });
    
    // Purchase History button
    btnPurchaseHistory.addEventListener('click', (e) => {
        e.preventDefault();
        showPurchaseHistory();
        userMenuBtn.classList.remove('active');
        userMenuDropdown.classList.remove('show');
    });
    
    // Unlocked Dancers button
    btnUnlockedDancers.addEventListener('click', (e) => {
        e.preventDefault();
        showUnlockedDancers();
        userMenuBtn.classList.remove('active');
        userMenuDropdown.classList.remove('show');
    });
    
    // Logout button
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// ===== Credit System =====
function initCreditSystem() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        await loginOrRegister(email);
    });
    
    // Credit purchase buttons
    const purchaseButtons = document.querySelectorAll('.btn-purchase');
    purchaseButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const credits = parseInt(btn.dataset.package);
            const price = parseInt(btn.dataset.price);
            await purchaseCredits(credits, price);
        });
    });
}

async function purchaseCredits(credits, price) {
    if (!state.currentUser) {
        showToast('로그인이 필요합니다', 'error');
        showLoginModal();
        return;
    }
    
    // Mockup payment - 실제로는 결제 API 연동
    const confirmed = confirm(`${credits} 크레딧을 ${price.toLocaleString()}원에 구매하시겠습니까?\n\n(Mockup 결제 - 실제 결제는 연동 예정)`);
    
    if (!confirmed) return;
    
    try {
        // Update user credits
        const newCredits = state.currentUser.credits + credits;
        const purchase = {
            date: Date.now(),
            credits: credits,
            price: price,
            method: 'mockup'
        };
        
        const purchaseHistory = [...(state.currentUser.purchaseHistory || []), purchase];
        
        const response = await fetch(`tables/users/${state.currentUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                credits: newCredits,
                purchaseHistory: purchaseHistory
            })
        });
        
        if (response.ok) {
            state.currentUser.credits = newCredits;
            state.currentUser.purchaseHistory = purchaseHistory;
            updateUserUI();
            closeModal('creditChargeModal');
            showToast(`🎉 ${credits} 크레딧이 충전되었습니다!`, 'success');
        } else {
            throw new Error('Failed to update credits');
        }
        
    } catch (error) {
        console.error('❌ Error purchasing credits:', error);
        showToast('크레딧 충전 중 오류가 발생했습니다', 'error');
    }
}

async function unlockDancerContact(dancerId) {
    if (!state.currentUser) {
        showToast('로그인이 필요합니다', 'error');
        showLoginModal();
        return false;
    }
    
    // Check if already unlocked
    const usedDancers = state.currentUser.usedDancers || [];
    if (usedDancers.includes(dancerId)) {
        return true; // Already unlocked, no credit needed
    }
    
    // Check credits
    if (state.currentUser.credits < 1) {
        showToast('크레딧이 부족합니다', 'error');
        openModal('creditChargeModal');
        return false;
    }
    
    // Confirm
    const confirmed = confirm('1 크레딧을 사용하여 연락처를 확인하시겠습니까?');
    if (!confirmed) return false;
    
    try {
        // Deduct credit and add to usedDancers
        const newCredits = state.currentUser.credits - 1;
        const newUsedDancers = [...usedDancers, dancerId];
        
        const response = await fetch(`tables/users/${state.currentUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                credits: newCredits,
                usedDancers: newUsedDancers
            })
        });
        
        if (response.ok) {
            state.currentUser.credits = newCredits;
            state.currentUser.usedDancers = newUsedDancers;
            updateUserUI();
            showToast('✅ 연락처가 공개되었습니다 (-1 Credit)', 'success');
            return true;
        } else {
            throw new Error('Failed to unlock contact');
        }
        
    } catch (error) {
        console.error('❌ Error unlocking contact:', error);
        showToast('연락처 공개 중 오류가 발생했습니다', 'error');
        return false;
    }
}

function isContactUnlocked(dancerId) {
    if (!state.currentUser) return false;
    const usedDancers = state.currentUser.usedDancers || [];
    return usedDancers.includes(dancerId);
}

// ===== Featured Dancers (무한 슬라이더 프리미엄 댄서) =====
async function loadFeaturedDancers() {
    try {
        const response = await fetch('tables/featured_dancers?limit=100');
        const data = await response.json();
        state.featuredDancers = data.data || [];
        
        // 데이터가 없으면 임시 데이터 사용
        if (state.featuredDancers.length === 0) {
            state.featuredDancers = [
                {
                    id: 'temp1',
                    name: '김민지',
                    name_en: 'Kim Minji',
                    specialty: 'K-pop, Contemporary',
                    image_url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800',
                    bio: '10년 경력의 프로페셔널 댄서로 다양한 장르를 소화합니다.',
                    email: 'minji@utopiax.kr',
                    instagram: '@dancer_minji'
                },
                {
                    id: 'temp2',
                    name: '박서준',
                    name_en: 'Park Seojun',
                    specialty: 'Hip-hop, Breaking',
                    image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
                    bio: '국제 대회 수상 경력의 비보이 출신 댄서입니다.',
                    email: 'seojun@utopiax.kr',
                    instagram: '@bboy_seojun'
                },
                {
                    id: 'temp3',
                    name: '이하은',
                    name_en: 'Lee Haeun',
                    specialty: 'Contemporary, Ballet',
                    image_url: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800',
                    bio: '발레 전공 출신의 컨템포러리 전문 댄서입니다.',
                    email: 'haeun@utopiax.kr',
                    instagram: '@contemporary_haeun'
                },
                {
                    id: 'temp4',
                    name: '정우진',
                    name_en: 'Jung Woojin',
                    specialty: 'Popping, Locking',
                    image_url: 'https://images.unsplash.com/photo-1504598318550-17eba1008a68?w=800',
                    bio: '팝핀, 락킹 전문 댄서로 CF 및 뮤직비디오 출연 다수',
                    email: 'woojin@utopiax.kr',
                    instagram: '@poppin_woojin'
                }
            ];
            console.log('✅ Using temporary featured dancers:', state.featuredDancers.length);
        } else {
            console.log('✅ Loaded featured dancers:', state.featuredDancers.length);
        }
    } catch (error) {
        console.error('❌ Error loading featured dancers:', error);
        // 에러 시에도 임시 데이터 사용
        state.featuredDancers = [
            {
                id: 'temp1',
                name: '김민지',
                name_en: 'Kim Minji',
                specialty: 'K-pop, Contemporary',
                image_url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800',
                bio: '10년 경력의 프로페셔널 댄서로 다양한 장르를 소화합니다.',
                email: 'minji@utopiax.kr',
                instagram: '@dancer_minji'
            }
        ];
    }
}

function showFeaturedDancerModal(dancer) {
    // If dancer is a string (HTML attribute), parse it
    if (typeof dancer === 'string') {
        try {
            dancer = JSON.parse(dancer.replace(/&quot;/g, '"'));
        } catch (e) {
            console.error('Failed to parse dancer data:', e);
            return;
        }
    }
    
    // Create featured dancer modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'featuredDancerModal';
    
    modal.innerHTML = `
        <div class="modal-content modal-md">
            <button class="modal-close" onclick="closeModal('featuredDancerModal')">&times;</button>
            <div class="modal-header">
                <h2>⭐ 프리미엄 협찬 댄서</h2>
                <p>${dancer.name} - ${dancer.specialty || 'Professional Dancer'}</p>
            </div>
            <div class="modal-form">
                <div class="featured-dancer-profile">
                    <img src="${dancer.image_url}" alt="${dancer.name}" style="width: 100%; max-width: 400px; border-radius: 16px; margin-bottom: 20px;">
                    <h3 style="font-size: 24px; margin-bottom: 10px;">${dancer.name}${dancer.name_en ? ' (' + dancer.name_en + ')' : ''}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">${dancer.bio || '프로페셔널 댄서입니다.'}</p>
                    
                    <div style="background: var(--bg-light-secondary); padding: 20px; border-radius: 12px; margin-top: 20px; border: 2px solid #FFD700;">
                        <h4 style="margin-bottom: 15px; color: var(--primary-purple);">
                            <i class="fas fa-gift"></i> 무료 연락처 제공
                        </h4>
                        <div style="font-size: 16px; line-height: 1.8;">
                            ${dancer.email ? `
                                <p style="margin-bottom: 10px;"><i class="fas fa-envelope"></i> <strong>이메일:</strong> 
                                <a href="mailto:${dancer.email}" style="color: var(--primary-blue);">${dancer.email}</a></p>
                            ` : ''}
                            ${dancer.instagram ? `
                                <p style="margin-bottom: 10px;"><i class="fab fa-instagram"></i> <strong>인스타그램:</strong> 
                                <a href="https://instagram.com/${dancer.instagram.replace('@', '')}" target="_blank" style="color: var(--primary-pink);">${dancer.instagram}</a></p>
                            ` : ''}
                        </div>
                        ${dancer.video_url ? `
                            <a href="${dancer.video_url}" target="_blank" class="btn btn-gradient" style="width: 100%; margin-top: 15px;">
                                <i class="fas fa-play"></i> 포트폴리오 영상 보기
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal('featuredDancerModal');
        }
    });
}

// ===== Helper Functions =====
function showLoginModal() {
    openModal('loginModal');
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#6366F1'};
        color: white;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Export functions to global scope
window.unlockDancerContact = unlockDancerContact;
window.isContactUnlocked = isContactUnlocked;
window.showFeaturedDancerModal = showFeaturedDancerModal;

// ===== User Info Modals =====
function showMyProfile() {
    if (!state.currentUser) {
        showToast('로그인이 필요합니다', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'myProfileModal';
    
    const joinDate = new Date(state.currentUser.createdAt).toLocaleDateString('ko-KR');
    const lastLogin = new Date(state.currentUser.lastLogin).toLocaleDateString('ko-KR');
    
    modal.innerHTML = `
        <div class="modal-content modal-md">
            <button class="modal-close" onclick="closeModal('myProfileModal')">&times;</button>
            <div class="modal-header">
                <h2>👤 내 정보</h2>
                <p>회원 정보 및 활동 내역</p>
            </div>
            <div class="modal-form">
                <div class="profile-info-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                    <div class="info-card" style="background: var(--bg-dark); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">이메일</div>
                        <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">${state.currentUser.email}</div>
                    </div>
                    <div class="info-card" style="background: var(--bg-dark); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">잔여 크레딧</div>
                        <div style="font-size: 24px; font-weight: 700; color: #FFD700;">${state.currentUser.credits} C</div>
                    </div>
                    <div class="info-card" style="background: var(--bg-dark); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">가입일</div>
                        <div style="font-size: 16px; color: var(--text-primary);">${joinDate}</div>
                    </div>
                    <div class="info-card" style="background: var(--bg-dark); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">마지막 로그인</div>
                        <div style="font-size: 16px; color: var(--text-primary);">${lastLogin}</div>
                    </div>
                </div>
                <div class="profile-stats" style="margin-top: 30px; background: linear-gradient(135deg, rgba(233, 30, 132, 0.1), rgba(157, 78, 221, 0.1)); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                    <h3 style="margin-bottom: 15px; color: var(--primary-purple);">활동 통계</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
                        <div>
                            <div style="font-size: 28px; font-weight: 700; color: var(--text-primary);">${(state.currentUser.usedDancers || []).length}</div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">잠금 해제 댄서</div>
                        </div>
                        <div>
                            <div style="font-size: 28px; font-weight: 700; color: var(--text-primary);">${(state.currentUser.purchaseHistory || []).length}</div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">구매 횟수</div>
                        </div>
                        <div>
                            <div style="font-size: 28px; font-weight: 700; color: #10B981;">${(state.currentUser.purchaseHistory || []).reduce((sum, p) => sum + p.credits, 10)}</div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">총 획득 크레딧</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal('myProfileModal');
        }
    });
}

function showPurchaseHistory() {
    if (!state.currentUser) {
        showToast('로그인이 필요합니다', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'purchaseHistoryModal';
    
    const history = state.currentUser.purchaseHistory || [];
    
    modal.innerHTML = `
        <div class="modal-content modal-md">
            <button class="modal-close" onclick="closeModal('purchaseHistoryModal')">&times;</button>
            <div class="modal-header">
                <h2>💳 구매 내역</h2>
                <p>크레딧 충전 내역 (총 ${history.length}건)</p>
            </div>
            <div class="modal-form">
                ${history.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                        <i class="fas fa-receipt" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                        <p>구매 내역이 없습니다</p>
                        <button class="btn btn-gradient" onclick="closeModal('purchaseHistoryModal'); openModal('creditCharge');" style="margin-top: 20px;">
                            <i class="fas fa-plus"></i> 크레딧 충전하기
                        </button>
                    </div>
                ` : `
                    <div class="purchase-list" style="display: flex; flex-direction: column; gap: 15px;">
                        ${history.map((purchase, index) => {
                            const date = new Date(purchase.date).toLocaleString('ko-KR');
                            return `
                                <div class="purchase-item" style="background: var(--bg-dark); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                        <div>
                                            <div style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 5px;">
                                                ${purchase.credits} 크레딧
                                            </div>
                                            <div style="font-size: 13px; color: var(--text-secondary);">
                                                ${date}
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-size: 20px; font-weight: 700; color: #10B981;">
                                                ${purchase.price.toLocaleString()}원
                                            </div>
                                            <div style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">
                                                ${purchase.method || 'mockup'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).reverse().join('')}
                    </div>
                `}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal('purchaseHistoryModal');
        }
    });
}

function showUnlockedDancers() {
    if (!state.currentUser) {
        showToast('로그인이 필요합니다', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'unlockedDancersModal';
    
    const unlockedIds = state.currentUser.usedDancers || [];
    const unlockedDancers = state.dancers.filter(d => unlockedIds.includes(d.id));
    
    modal.innerHTML = `
        <div class="modal-content modal-md">
            <button class="modal-close" onclick="closeModal('unlockedDancersModal')">&times;</button>
            <div class="modal-header">
                <h2>🔓 잠금 해제 댄서</h2>
                <p>연락처를 확인한 댄서 목록 (총 ${unlockedDancers.length}명)</p>
            </div>
            <div class="modal-form">
                ${unlockedDancers.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                        <i class="fas fa-lock" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                        <p>아직 잠금 해제한 댄서가 없습니다</p>
                        <button class="btn btn-gradient" onclick="closeModal('unlockedDancersModal'); openModal('casting');" style="margin-top: 20px;">
                            <i class="fas fa-search"></i> 댄서 찾아보기
                        </button>
                    </div>
                ` : `
                    <div class="unlocked-dancers-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
                        ${unlockedDancers.map(dancer => `
                            <div class="dancer-card" style="background: var(--bg-dark); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color);">
                                <img src="${dancer.image_url}" alt="${dancer.name}" style="width: 100%; height: 200px; object-fit: cover;">
                                <div style="padding: 15px;">
                                    <h4 style="margin-bottom: 5px;">${dancer.name}</h4>
                                    <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">${dancer.specialty}</p>
                                    <div style="font-size: 13px; line-height: 1.8; color: var(--text-primary);">
                                        ${dancer.phone ? `<p><i class="fas fa-phone"></i> ${dancer.phone}</p>` : ''}
                                        ${dancer.email ? `<p><i class="fas fa-envelope"></i> ${dancer.email}</p>` : ''}
                                        ${dancer.instagram ? `<p><i class="fab fa-instagram"></i> ${dancer.instagram}</p>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal('unlockedDancersModal');
        }
    });
}
