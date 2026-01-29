// ===================================
//  UTOPIA X - Main JavaScript with AI Matching
// ===================================

// Global State
const state = {
    dancers: [],
    featuredDancers: [],
    isLoading: false,
    aiMatchResults: null,
    currentUser: null // { email, credits, usedDancers: [] }
};

// ===== Check User Session (PRIORITY) =====
async function checkUserSession() {
    console.log('🔍 Checking user session...');
    
    // CRITICAL: Update UI immediately using sessionStorage (synchronous, fast)
    const userEmail = sessionStorage.getItem('userEmail');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    
    if (userEmail && userEmail !== 'Login') {
        if (userEmailDisplay) {
            userEmailDisplay.textContent = userEmail;
            console.log('✅ UI updated immediately:', userEmail);
        }
    } else {
        if (userEmailDisplay) {
            userEmailDisplay.textContent = 'Login';
        }
    }
    
    // Then check Supabase auth (async, slower)
    if (typeof window.supabase !== 'undefined') {
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            if (user) {
                state.currentUser = user;
                console.log('✅ Supabase user verified:', user.email);
            }
        } catch (error) {
            console.warn('⚠️ Error checking Supabase session:', error);
        }
    }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 UTOPIA X - Starting initialization...');
    
    try {
        // CRITICAL: Check user session FIRST (prevents FOUC)
        console.log('✅ Checking user session (PRIORITY)...');
        await checkUserSession();
        
        // Initialize authentication system
        if (typeof initAuth === 'function') {
            console.log('✅ Initializing auth...');
            await initAuth();
        }
        
        console.log('✅ Initializing navigation...');
        initNavigation();
        
        console.log('✅ Initializing modals...');
        initModals();
        
        console.log('✅ Loading dancers...');
        await loadDancers();
        
        console.log('✅ Loading featured dancers...');
        await loadFeaturedDancers();
        
        console.log('✅ Initializing infinite slider...');
        initInfiniteSlider();
        
        console.log('✅ Initializing forms...');
        initForms();
        
        console.log('✅ Initializing scroll animations...');
        initScrollAnimations();
        
        console.log('✅ Initializing user menu...');
        initUserMenu();
        
        console.log('✅ Initializing credit system...');
        initCreditSystem();
        
        console.log('✅ Initializing auth forms...');
        initAuthForms();
        
        console.log('✅ Setting up fallback handlers...');
        setupFallbackHandlers();
        
        console.log('🎉 All initialization complete!');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        console.error('Stack trace:', error.stack);
    }
});

// ===== Fallback Handlers (Emergency Safety Net) =====
function setupFallbackHandlers() {
    console.log('🛡️ Setting up emergency fallback handlers...');
    
    // CRITICAL: Emergency login button handler
    // This runs AFTER all other initialization
    // If userMenuBtn somehow doesn't have a handler, this catches it
    setTimeout(() => {
        const userMenuBtn = document.getElementById('userMenuBtn');
        if (userMenuBtn) {
            // Check if handler is already attached by counting listeners
            const listenerCount = window.getEventListeners ? 
                window.getEventListeners(userMenuBtn).click?.length : 0;
            
            console.log(`🔍 userMenuBtn listener check: ${listenerCount > 0 ? 'OK' : 'ADDING FALLBACK'}`);
            
            // Add one more guaranteed handler as fallback
            userMenuBtn.addEventListener('click', (e) => {
                console.log('🚨 FALLBACK handler triggered for userMenuBtn');
                const userEmail = sessionStorage.getItem('userEmail');
                const isLoggedIn = !!(userEmail && userEmail !== 'Login');
                
                if (!isLoggedIn) {
                    console.log('↪️ Redirecting to login...');
                    openModalDirect('loginModal');
                }
            }, { once: false, capture: false });
        }
        
        // CRITICAL: Emergency CTA card handlers
        const ctaCards = document.querySelectorAll('.cta-card');
        console.log(`🔍 CTA cards found: ${ctaCards.length}`);
        
        ctaCards.forEach((card, index) => {
            const modalType = card.dataset.modal;
            if (!modalType) return;
            
            // Add fallback handler
            card.addEventListener('click', (e) => {
                console.log(`🚨 FALLBACK CTA handler: ${modalType}`);
                handleModalOpen(modalType);
            }, { once: false, capture: true }); // Use capture phase
            
            console.log(`✅ Fallback added for CTA card ${index + 1}: ${modalType}`);
        });
        
        console.log('✅ Emergency fallback handlers installed');
    }, 500); // Run after initial setup
}

// ===== Navigation =====
function initNavigation() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.98)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        }
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }
}

// ===== Modal Functions =====
function initModals() {
    console.log('🔧 Initializing modals...');
    
    try {
        // CTA Cards click to open modals (with event delegation for buttons)
        const ctaCards = document.querySelectorAll('.cta-card');
        console.log(`📦 Found ${ctaCards.length} CTA cards`);
        
        ctaCards.forEach((card, index) => {
            const modalType = card.dataset.modal;
            console.log(`  - Card ${index + 1}: ${modalType}`);
            
            if (!modalType) {
                console.warn(`⚠️ Card ${index + 1} has no data-modal attribute`);
                return;
            }
            
            // Card click handler
            card.addEventListener('click', (e) => {
                console.log('🖱️ CTA card clicked:', modalType);
                handleModalOpen(modalType);
            });
            
            // Button inside card click handler
            const button = card.querySelector('button');
            if (button) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent double triggering
                    console.log('🖱️ Button clicked inside card:', modalType);
                    handleModalOpen(modalType);
                });
                console.log(`  ✅ Button bound for ${modalType}`);
            }
        });

        // Footer links to open modals
        const modalLinks = document.querySelectorAll('.open-modal');
        console.log(`🔗 Found ${modalLinks.length} modal links`);
        
        modalLinks.forEach(link => {
            const modalType = link.dataset.modal;
            if (!modalType) {
                console.warn('⚠️ Link has no data-modal attribute');
                return;
            }
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔗 Modal link clicked:', modalType);
                handleModalOpen(modalType);
            });
        });

        // Close buttons
        const closeButtons = document.querySelectorAll('.modal-close');
        console.log(`❌ Found ${closeButtons.length} close buttons`);
        
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('❌ Close button clicked');
                closeAllModals();
            });
        });

        console.log('✅ Modals initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing modals:', error);
    }
}

// Safe modal open handler with role checking
function handleModalOpen(modalType) {
    console.log(`🎯 handleModalOpen called: ${modalType}`);
    
    try {
        // Get user info from sessionStorage (synchronous, fast)
        const userEmail = sessionStorage.getItem('userEmail');
        const userType = sessionStorage.getItem('userType');
        const userRole = sessionStorage.getItem('userRole');
        const isLoggedIn = !!(userEmail && userEmail !== 'Login');
        
        console.log('👤 User status:', { isLoggedIn, userEmail, userType, userRole });
        
        // Handle different modal types
        if (modalType === 'login' || modalType === 'loginModal') {
            // Always allow opening login modal
            console.log('✅ Opening login modal');
            openModalDirect(modalType);
            return;
        }
        
        // Check if login required for other modals
        if (modalType === 'casting' || modalType === 'artist') {
            if (!isLoggedIn) {
                console.log('⚠️ User not logged in, showing login modal');
                showToast('먼저 로그인해주세요 🔐', 'info');
                setTimeout(() => {
                    openLoginModal(); // Use dedicated login function
                }, 500);
                return;
            }
            
            // Role-based access control
            if (modalType === 'casting') {
                if (userType === 'artist' || userRole === 'artist') {
                    console.log('❌ Artist trying to access casting');
                    showToast('❌ 댄서 섭외는 클라이언트 계정만 가능합니다', 'error');
                    return;
                }
            }
            
            if (modalType === 'artist') {
                if (userType === 'client' || userRole === 'client') {
                    console.log('❌ Client trying to access artist registration');
                    showToast('❌ 아티스트 프로필 등록은 아티스트 계정만 가능합니다', 'error');
                    return;
                }
            }
        }
        
        // Open the modal
        console.log('✅ Opening modal:', modalType);
        openModalDirect(modalType);
        
        // Prefill form if needed
        if (modalType === 'casting' && isLoggedIn) {
            setTimeout(() => {
                prefillCastingForm();
            }, 100);
        }
        
    } catch (error) {
        console.error('❌ Error in handleModalOpen:', error);
        // Fallback: just open the modal
        openModalDirect(modalType);
    }
}

// Direct modal opener (no async, no checks)
function openModalDirect(type) {
    console.log(`📂 openModalDirect: ${type}`);
    
    try {
        closeAllModals();
        
        const modalMap = {
            'casting': 'castingModal',
            'artist': 'artistModal',
            'loginModal': 'loginModal',
            'login': 'loginModal',
            'creditCharge': 'creditChargeModal'
        };
        
        const modalId = modalMap[type] || (type + 'Modal');
        const modal = document.getElementById(modalId);
        
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // CRITICAL: Initialize login modal to Sign In tab
            if (modalId === 'loginModal') {
                console.log('🔑 Initializing login modal to Sign In tab...');
                
                // Always start with Sign In tab
                const signInTab = document.querySelector('.auth-tab[data-tab="signin"]');
                const signUpTab = document.querySelector('.auth-tab[data-tab="signup"]');
                const signInForm = document.getElementById('signInForm');
                const signUpForm = document.getElementById('signUpForm');
                
                if (signInTab) signInTab.classList.add('active');
                if (signUpTab) signUpTab.classList.remove('active');
                if (signInForm) signInForm.classList.add('active');
                if (signUpForm) signUpForm.classList.remove('active');
                
                // CRITICAL: Initialize signup steps (hide Step 2)
                const signUpStep1 = document.getElementById('signUpStep1');
                const signUpStep2 = document.getElementById('signUpStep2');
                
                if (signUpStep1) {
                    signUpStep1.style.display = 'block';
                    console.log('  ✅ Step 1 ready (hidden for now)');
                }
                
                if (signUpStep2) {
                    signUpStep2.style.display = 'none';
                    console.log('  ✅ Step 2 hidden');
                }
                
                console.log('✅ Login modal initialized to Sign In tab');
            }
            
            console.log(`✅ Modal opened: ${modalId}`);
        } else {
            console.error(`❌ Modal not found: ${modalId}`);
        }
    } catch (error) {
        console.error('❌ Error in openModalDirect:', error);
    }
}

// Make functions globally accessible
window.handleModalOpen = handleModalOpen;
window.openModalDirect = openModalDirect;

// Wrapper for backward compatibility
function openModal(type) {
    console.log(`🔄 openModal called (redirecting to handleModalOpen): ${type}`);
    handleModalOpen(type);
}

// Make openModal globally accessible
window.openModal = openModal;

// ===== 🔑 Open Login Modal (Sign In Only) =====
function openLoginModal() {
    console.log('🔑 openLoginModal called - Opening LOGIN view');
    
    const modal = document.getElementById('loginModal');
    if (!modal) {
        console.error('❌ Login modal not found!');
        return;
    }
    
    // Close all other modals
    closeAllModals();
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Switch to Sign In tab
    const signInTab = document.querySelector('.auth-tab[data-tab="signin"]');
    const signUpTab = document.querySelector('.auth-tab[data-tab="signup"]');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    
    if (signInTab) signInTab.classList.add('active');
    if (signUpTab) signUpTab.classList.remove('active');
    if (signInForm) signInForm.classList.add('active');
    if (signUpForm) signUpForm.classList.remove('active');
    
    // Hide signup steps
    const signUpStep1 = document.getElementById('signUpStep1');
    const signUpStep2 = document.getElementById('signUpStep2');
    if (signUpStep1) signUpStep1.style.display = 'none';
    if (signUpStep2) signUpStep2.style.display = 'none';
    
    console.log('✅ Login modal opened - Sign In view only');
}

// ===== ✨ Open Signup Modal (User Type Selection) =====
function openSignupModal() {
    console.log('✨ openSignupModal called - Opening SIGNUP view');
    
    const modal = document.getElementById('loginModal');
    if (!modal) {
        console.error('❌ Login modal not found!');
        return;
    }
    
    // Close all other modals
    closeAllModals();
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Switch to Sign Up tab
    const signInTab = document.querySelector('.auth-tab[data-tab="signin"]');
    const signUpTab = document.querySelector('.auth-tab[data-tab="signup"]');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    
    if (signInTab) signInTab.classList.remove('active');
    if (signUpTab) signUpTab.classList.add('active');
    if (signInForm) signInForm.classList.remove('active');
    if (signUpForm) signUpForm.classList.add('active');
    
    // CRITICAL: Show Step 1 (User Type Selection), Hide Step 2
    const signUpStep1 = document.getElementById('signUpStep1');
    const signUpStep2 = document.getElementById('signUpStep2');
    
    if (signUpStep1) {
        signUpStep1.style.display = 'block';
        console.log('  ✅ Step 1 (User Type Selection) visible');
    }
    
    if (signUpStep2) {
        signUpStep2.style.display = 'none';
        console.log('  ✅ Step 2 (Form) hidden');
    }
    
    console.log('✅ Signup modal opened - User Type Selection view');
}

// Make new functions globally accessible
window.openLoginModal = openLoginModal;
window.openSignupModal = openSignupModal;

// Prefill casting form with user profile data (synchronous)
function prefillCastingForm() {
    console.log('📝 Prefilling casting form...');
    
    try {
        const userEmail = sessionStorage.getItem('userEmail');
        const userProfile = sessionStorage.getItem('userProfile');
        
        if (!userEmail) {
            console.warn('⚠️ No user email found');
            return;
        }
        
        // Get user data from sessionStorage (fast, synchronous)
        let userData = null;
    
        // Use sessionStorage profile (synchronous)
        if (userProfile) {
            try {
                userData = JSON.parse(userProfile);
                console.log('✅ Got user data from sessionStorage:', userData);
            } catch (error) {
                console.error('Error parsing user profile:', error);
            }
        }
    
    // Prefill fields
    const clientNameField = document.getElementById('clientName');
    const clientEmailField = document.getElementById('clientEmail');
    const clientPhoneField = document.getElementById('clientPhone');
    
    if (clientEmailField) {
        clientEmailField.value = userEmail;
        clientEmailField.style.backgroundColor = 'rgba(157, 78, 221, 0.1)';
        console.log('✅ Prefilled email:', userEmail);
    }
    
        if (userData) {
            if (clientNameField && userData.name) {
                clientNameField.value = userData.name;
                clientNameField.style.backgroundColor = 'rgba(157, 78, 221, 0.1)';
                console.log('✅ Prefilled name:', userData.name);
            }
            
            if (clientPhoneField && userData.phone) {
                clientPhoneField.value = userData.phone;
                clientPhoneField.style.backgroundColor = 'rgba(157, 78, 221, 0.1)';
                console.log('✅ Prefilled phone:', userData.phone);
            }
        }
        
        console.log('✅ Casting form prefilled successfully');
    } catch (error) {
        console.error('❌ Error prefilling form:', error);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        
        // Remove dynamic modals
        if (modalId === 'featuredDancerModal') {
            setTimeout(() => modal.remove(), 300);
        }
    }
    document.body.style.overflow = '';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

// ===== Load Dancers from API =====
async function loadDancers() {
    try {
        state.isLoading = true;
        const response = await fetch('tables/dancers?limit=100');
        const data = await response.json();
        state.dancers = data.data || [];
        console.log('Loaded dancers:', state.dancers.length);
    } catch (error) {
        console.warn('⚠️ Error loading dancers (silent):', error);
        // 조용히 처리: 에러 토스트 표시 안 함
        state.dancers = []; // 빈 배열로 초기화
    } finally {
        state.isLoading = false;
    }
}

// ===== Load Featured Dancers =====
async function loadFeaturedDancers() {
    try {
        const response = await fetch('tables/featured-dancers?limit=20');
        const data = await response.json();
        state.featuredDancers = data.data || [];
        console.log('Loaded featured dancers:', state.featuredDancers.length);
    } catch (error) {
        console.warn('⚠️ Error loading featured dancers (silent):', error);
        // 조용히 처리: 에러 토스트 표시 안 함
        state.featuredDancers = []; // 빈 배열로 초기화
    }
}

// ===== Featured Dancers Grid =====
function initInfiniteSlider() {
    // Use featured dancers for grid display
    const dancersToShow = state.featuredDancers.length > 0 ? state.featuredDancers : [];
    
    const gridContainer = document.getElementById('featuredDancersGrid');
    if (!gridContainer) {
        console.log('Featured dancers grid container not found');
        return;
    }
    
    if (dancersToShow.length === 0) {
        gridContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">프리미엄 댄서가 곧 추가됩니다.</p>';
        return;
    }

    // Render featured dancer cards
    gridContainer.innerHTML = dancersToShow.map((dancer) => `
        <div class="featured-dancer-card" onclick="showFeaturedDancerModal(${JSON.stringify(dancer).replace(/"/g, '&quot;')})">
            <div class="premium-badge">
                <i class="fas fa-crown"></i> 광고 협찬
            </div>
            <img src="${dancer.image_url}" alt="${dancer.name}" class="dancer-image" onerror="this.src='https://images.unsplash.com/photo-1547153760-18fc86324498?w=800'">
            <div class="dancer-info">
                <div class="dancer-name">${dancer.name}</div>
                <div class="dancer-name-en">${dancer.name_en || ''}</div>
                <span class="dancer-specialty">${dancer.specialty || 'Professional Dancer'}</span>
                <p class="dancer-bio">${dancer.bio || '프로페셔널 댄서입니다.'}</p>
                <div class="contact-preview">
                    <p><i class="fas fa-gift"></i> <strong>무료 연락처 제공</strong></p>
                    ${dancer.email ? `<p><i class="fas fa-envelope"></i> <a href="mailto:${dancer.email}">${dancer.email}</a></p>` : ''}
                    ${dancer.instagram ? `<p><i class="fab fa-instagram"></i> <a href="https://instagram.com/${dancer.instagram.replace('@', '')}" target="_blank">${dancer.instagram}</a></p>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Convert 0-1 value to 1-3 level
function getStyleLevel(value) {
    if (value <= 0.33) return 1;
    if (value <= 0.66) return 2;
    return 3;
}

// ===== AI Matching Engine (Enhanced with Hard Filters + Soft Scores) =====
class AIMatchingEngine {
    
    constructor() {
        // Tag relations
        this.tagRelations = {
            conflicts: [
                ['tag_fresh', 'tag_dark'],
                ['tag_sexy', 'tag_cute'],
                ['tag_powerful', 'tag_soft'],
                ['tag_energetic', 'tag_calm'],
                ['tag_trendy', 'tag_classic'],
                ['tag_experimental', 'tag_commercial'],
                ['tag_young', 'tag_mature']
            ],
            synergies: [
                ['tag_fresh', 'tag_energetic', 'tag_young'],
                ['tag_dark', 'tag_powerful', 'tag_experimental'],
                ['tag_elegant', 'tag_classic', 'tag_soft'],
                ['tag_street', 'tag_powerful', 'tag_athletic']
            ]
        };
    }

    /**
     * Main matching function with Hard Filters + Soft Scores
     * @param {Object} aiAnalysis - { hardFilters, softScores }
     * @param {Array} dancers - Full dancer database
     * @param {Number} topN - Number of top matches to return
     */
    findMatches(aiAnalysis, dancers, topN = 5) {
        console.log('🎯 AI Matching started...', aiAnalysis);
        
        // Step 1: Apply hard filters (MUST match)
        let filteredDancers = dancers;
        if (aiAnalysis.hardFilters) {
            filteredDancers = this.applyHardFilters(dancers, aiAnalysis.hardFilters);
            console.log(`🔍 Hard Filters: ${dancers.length} -> ${filteredDancers.length} dancers`);
        }
        
        if (filteredDancers.length === 0) {
            console.warn('⚠️ No dancers passed hard filters!');
            return [];
        }
        
        // Step 2: Score with soft scores (weighted preferences)
        const softScores = aiAnalysis.softScores || aiAnalysis; // backward compatibility
        const scoredDancers = filteredDancers.map(dancer => {
            const scoreResult = this.calculateMatchScore(softScores, dancer);
            return {
                dancer,
                ...scoreResult
            };
        });
        
        // Step 3: Sort and return top N
        const ranked = scoredDancers
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, topN);
        
        console.log('✅ Top matches:', ranked.map(r => `${r.dancer.name} (${r.totalScore}점)`));
        return ranked;
    }

    /**
     * Apply hard filters (mandatory conditions)
     */
    applyHardFilters(dancers, filters) {
        return dancers.filter(dancer => {
            // Gender filter
            if (filters.gender && dancer.gender !== filters.gender) {
                return false;
            }
            
            // Height filter (min/max)
            if (filters.heightCm) {
                const height = dancer.heightCm || dancer.height || 0;
                if (filters.heightCm.min && height < filters.heightCm.min) return false;
                if (filters.heightCm.max && height > filters.heightCm.max) return false;
            }
            
            // Body frame filter
            if (filters.bodyFrame && dancer.bodyFrame !== filters.bodyFrame) {
                return false;
            }
            
            // Hair color filter (must have at least one)
            if (filters.hairColor && filters.hairColor.length > 0) {
                const dancerColors = (dancer.hairColor || '').split(',').map(c => c.trim());
                const hasMatch = filters.hairColor.some(required => dancerColors.includes(required));
                if (!hasMatch) return false;
            }
            
            // Kids friendly (required)
            if (filters.kidsFriendly === true && !dancer.kidsFriendly) {
                return false;
            }
            
            // Acting skill (minimum threshold)
            if (filters.actingMin && (dancer.acting || 0) < filters.actingMin) {
                return false;
            }
            
            // Singing skill (minimum threshold)
            if (filters.singingMin && (dancer.singing || 0) < filters.singingMin) {
                return false;
            }
            
            // SFX makeup required
            if (filters.sfxMakeupOk === true && !dancer.sfxMakeupOk) {
                return false;
            }
            
            // Cosplay experience required
            if (filters.cosplayExperience === true && !dancer.cosplayExperience) {
                return false;
            }
            
            // Horror ready required
            if (filters.horrorReady === true && !dancer.horrorReady) {
                return false;
            }
            
            // Gamer/nerd knowledge required
            if (filters.gamerNerd === true && !dancer.gamerNerd) {
                return false;
            }
            
            return true; // Passed all filters
        });
    }

    /**
     * Calculate match score (weighted soft scores)
     */
    calculateMatchScore(softScores, dancer) {
        const tagScores = {};
        let weightedSum = 0;
        let totalWeight = 0;
        
        // Base tag matching (tags, skills, style attributes)
        Object.entries(softScores).forEach(([field, weight]) => {
            // Normalize field name (handle both tag_xxx and direct field names)
            const dancerValue = dancer[field] || dancer[`tag_${field}`] || 0;
            
            // Normalize to 0-1 scale if needed
            let normalizedValue = dancerValue;
            if (dancerValue > 1) {
                normalizedValue = dancerValue / 100; // convert 0-100 to 0-1
            }
            
            const weightedScore = weight * normalizedValue;
            
            tagScores[field] = {
                aiWeight: weight,
                dancerScore: normalizedValue,
                contribution: weightedScore
            };
            
            weightedSum += weightedScore;
            totalWeight += weight;
        });
        
        let baseScore = totalWeight > 0 
            ? (weightedSum / totalWeight) * 100 
            : 0;
        
        // Synergy bonus
        let synergyBonus = 0;
        this.tagRelations.synergies.forEach(synergyGroup => {
            const requestedInGroup = synergyGroup.filter(tag => 
                (softScores[tag] || softScores[tag.replace('tag_', '')] || 0) > 0.5
            );
            
            if (requestedInGroup.length >= 2) {
                const dancerHasAll = requestedInGroup.every(tag => {
                    const val = dancer[tag] || dancer[tag.replace('tag_', '')] || 0;
                    return val >= 0.7;
                });
                
                if (dancerHasAll) {
                    synergyBonus += 5;
                }
            }
        });
        
        const totalScore = Math.min(100, Math.round(baseScore + synergyBonus));
        
        return {
            totalScore,
            breakdown: {
                baseScore: Math.round(baseScore),
                synergyBonus
            },
            tagScores,
            matchLevel: this.getMatchLevel(totalScore)
        };
    }

    /**
     * Get match level
     */
    getMatchLevel(score) {
        if (score >= 90) return { level: 'PERFECT', emoji: '🌟', label: '완벽한 매칭' };
        if (score >= 75) return { level: 'EXCELLENT', emoji: '✨', label: '훌륭한 매칭' };
        if (score >= 60) return { level: 'GOOD', emoji: '👍', label: '좋은 매칭' };
        if (score >= 40) return { level: 'FAIR', emoji: '🤔', label: '고려해볼 만함' };
        return { level: 'LOW', emoji: '⚠️', label: '낮은 적합도' };
    }

    /**
     * Format results for frontend
     */
    formatResults(matchResults) {
        return matchResults.map((result, index) => ({
            rank: index + 1,
            id: result.dancer.id,
            name: result.dancer.name,
            name_en: result.dancer.name_en,
            image_url: result.dancer.image_url,
            genres: result.dancer.genres,
            matchScore: result.totalScore,
            matchLevel: result.matchLevel,
            pricePerHour: result.dancer.price_per_hour,
            rating: result.dancer.rating,
            bio: result.dancer.bio,
            age: result.dancer.age,
            height: result.dancer.height || result.dancer.heightCm,
            specialty: result.dancer.specialty,
            details: {
                breakdown: result.breakdown,
                topMatchingTags: Object.entries(result.tagScores)
                    .sort((a, b) => b[1].contribution - a[1].contribution)
                    .slice(0, 3)
                    .map(([tag, data]) => ({
                        tag: tag.replace('tag_', ''),
                        match: Math.round(data.dancerScore * 100) + '%'
                    }))
            }
        }));
    }
}

// ===== Google Gemini API Integration (via Netlify Functions) =====
// API Key는 Netlify 환경 변수에 저장되어 보안이 유지됩니다.
const GEMINI_FUNCTION_URL = '/.netlify/functions/gemini-analyze';

/**
 * Analyze prompt using Google Gemini API
 */
async function analyzePromptWithAI(prompt) {
    // Show loading
    const loadingEl = document.getElementById('aiLoadingIndicator');
    if (loadingEl) {
        loadingEl.style.display = 'flex';
    }
    
    try {
        // Call Gemini API
        const analyzedTags = await callGeminiAPI(prompt);
        
        // Hide loading
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
        
        return analyzedTags;
        
    } catch (error) {
        console.error('❌ Gemini API Error:', error);
        
        // Hide loading
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
        
        // Fallback to simulated analysis
        console.warn('⚠️ Falling back to simulated analysis...');
        return simulateAIAnalysis(prompt);
    }
}

/**
 * Call Google Gemini API via Netlify Function (보안 강화)
 */
async function callGeminiAPI(userPrompt) {
    console.log('🚀 Calling Gemini via Netlify Function...');
    
    const response = await fetch(GEMINI_FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: userPrompt })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini Function error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 Gemini Response:', data);

    if (!data.success || !data.result) {
        throw new Error('Invalid response from Gemini Function');
    }

    console.log('✅ Parsed Result:', data.result);
    
    return data.result;
}

/**
 * Parse JSON from Gemini response (handles markdown code blocks)
 * NOTE: 이 함수는 이제 백업용으로만 사용됩니다 (Netlify Function에서 이미 파싱함)
 */
function parseGeminiJSON(text) {
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    
    // Pattern 1: ```json ... ```
    if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    }
    // Pattern 2: ``` ... ```
    else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    }
    
    cleanText = cleanText.trim();
    
    try {
        const parsed = JSON.parse(cleanText);
        
        // Validate structure
        if (!parsed.hardFilters) {
            parsed.hardFilters = {};
        }
        if (!parsed.softScores) {
            parsed.softScores = {};
        }
        
        return parsed;
        
    } catch (error) {
        console.error('❌ JSON Parse Error:', error);
        console.error('📄 Raw text:', cleanText);
        
        // Fallback: try to extract JSON manually
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error('❌ Fallback parse failed:', e);
            }
        }
        
        // Ultimate fallback
        return {
            hardFilters: {},
            softScores: {
                tag_commercial: 0.7,
                tag_trendy: 0.6,
                tag_energetic: 0.6
            }
        };
    }
}

/**
 * Simulated AI tag analysis with Hard Filters + Soft Scores
 * In production, this would call OpenAI API with enhanced system prompt
 * 
 * System Prompt Example:
 * "You are UTOPIA X AI Casting Director. Analyze client requests and output:
 * 1. hardFilters (MUST match): gender, heightCm range, bodyFrame, hairColor, kidsFriendly, 
 *    actingMin, singingMin, sfxMakeupOk, cosplayExperience, horrorReady, gamerNerd
 * 2. softScores (weighted preferences 0.0-1.0): all mood/energy/style/visual/skill tags
 * 
 * Example output format:
 * {
 *   'hardFilters': {
 *     'gender': 'female',
 *     'heightCm': { 'min': null, 'max': null },
 *     'hairColor': ['blonde'],
 *     'kidsFriendly': true,
 *     'actingMin': 60,
 *     'singingMin': 50
 *   },
 *   'softScores': {
 *     'tag_cute': 0.95,
 *     'tag_fresh': 0.9,
 *     'tag_energetic': 0.85,
 *     'tag_young': 0.8,
 *     'acting': 0.9,
 *     'singing': 0.8
 *   }
 * }"
 */
function simulateAIAnalysis(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    const analysis = {
        hardFilters: {},
        softScores: {}
    };
    
    // ===== HARD FILTERS (MUST match) =====
    
    // Gender detection
    if (lowerPrompt.includes('여성') || lowerPrompt.includes('female') || lowerPrompt.includes('여자')) {
        analysis.hardFilters.gender = 'female';
    } else if (lowerPrompt.includes('남성') || lowerPrompt.includes('male') || lowerPrompt.includes('남자')) {
        analysis.hardFilters.gender = 'male';
    }
    
    // Height detection (키 183cm 이상 등)
    const heightMatch = lowerPrompt.match(/키\s*(\d{3})\s*cm\s*(이상|이하|초과|미만)?/);
    if (heightMatch) {
        const height = parseInt(heightMatch[1]);
        const condition = heightMatch[2];
        
        if (!analysis.hardFilters.heightCm) {
            analysis.hardFilters.heightCm = {};
        }
        
        if (condition === '이상' || condition === '초과') {
            analysis.hardFilters.heightCm.min = height;
        } else if (condition === '이하' || condition === '미만') {
            analysis.hardFilters.heightCm.max = height;
        }
    }
    
    // Hair color (금발, 분홍머리 등)
    const hairColors = [];
    if (lowerPrompt.includes('금발') || lowerPrompt.includes('blonde')) hairColors.push('blonde');
    if (lowerPrompt.includes('분홍') || lowerPrompt.includes('핑크') || lowerPrompt.includes('pink')) hairColors.push('pink');
    if (lowerPrompt.includes('파란') || lowerPrompt.includes('blue')) hairColors.push('blue');
    if (lowerPrompt.includes('빨강') || lowerPrompt.includes('red')) hairColors.push('red');
    
    if (hairColors.length > 0) {
        analysis.hardFilters.hairColor = hairColors;
    }
    
    // Kids friendly (어린이, 유아, 티니핑, 뽀로로 등)
    if (lowerPrompt.includes('어린이') || lowerPrompt.includes('유아') || 
        lowerPrompt.includes('티니핑') || lowerPrompt.includes('뽀로로') ||
        lowerPrompt.includes('kids') || lowerPrompt.includes('children')) {
        analysis.hardFilters.kidsFriendly = true;
    }
    
    // Acting minimum (연기, 캐릭터 연기 등)
    if (lowerPrompt.includes('연기') || lowerPrompt.includes('acting') || 
        lowerPrompt.includes('캐릭터') || lowerPrompt.includes('character')) {
        analysis.hardFilters.actingMin = 60;
        analysis.softScores.acting = 0.9;
    }
    
    // Singing minimum (노래, 가창력, 싱어롱 등)
    if (lowerPrompt.includes('노래') || lowerPrompt.includes('가창') || 
        lowerPrompt.includes('singing') || lowerPrompt.includes('싱어롱')) {
        analysis.hardFilters.singingMin = 50;
        analysis.softScores.singing = 0.85;
    }
    
    // SFX makeup (특수분장, 좀비, 괴물 등)
    if (lowerPrompt.includes('특수분장') || lowerPrompt.includes('좀비') || 
        lowerPrompt.includes('괴물') || lowerPrompt.includes('sfx')) {
        analysis.hardFilters.sfxMakeupOk = true;
    }
    
    // Cosplay experience (코스프레, 리그오브레전드, 원신 등)
    if (lowerPrompt.includes('코스프레') || lowerPrompt.includes('cosplay') ||
        lowerPrompt.includes('리그오브레전드') || lowerPrompt.includes('원신') ||
        lowerPrompt.includes('genshin')) {
        analysis.hardFilters.cosplayExperience = true;
        analysis.softScores.gamerNerd = 0.8;
    }
    
    // Horror ready (공포, 호러, 할로윈 등)
    if (lowerPrompt.includes('공포') || lowerPrompt.includes('호러') || 
        lowerPrompt.includes('horror') || lowerPrompt.includes('할로윈')) {
        analysis.hardFilters.horrorReady = true;
        analysis.softScores.tag_dark = 0.95;
        analysis.softScores.tag_experimental = 0.85;
    }
    
    // Gamer/Nerd knowledge
    if (lowerPrompt.includes('게임') || lowerPrompt.includes('게이머') || 
        lowerPrompt.includes('너드') || lowerPrompt.includes('nerd')) {
        analysis.hardFilters.gamerNerd = true;
    }
    
    // ===== SOFT SCORES (weighted preferences) =====
    
    // Mood keywords
    if (lowerPrompt.includes('청량') || lowerPrompt.includes('상쾌') || 
        lowerPrompt.includes('탄산') || lowerPrompt.includes('fresh')) {
        analysis.softScores.tag_fresh = 0.95;
    }
    if (lowerPrompt.includes('어두') || lowerPrompt.includes('다크') || 
        lowerPrompt.includes('dark')) {
        analysis.softScores.tag_dark = 0.95;
    }
    if (lowerPrompt.includes('섹시') || lowerPrompt.includes('sexy') || lowerPrompt.includes('관능')) {
        analysis.softScores.tag_sexy = 0.9;
    }
    if (lowerPrompt.includes('귀여') || lowerPrompt.includes('cute') || 
        lowerPrompt.includes('사랑스') || lowerPrompt.includes('티니핑')) {
        analysis.softScores.tag_cute = 0.95;
    }
    if (lowerPrompt.includes('우아') || lowerPrompt.includes('elegant') || 
        lowerPrompt.includes('럭셔리') || lowerPrompt.includes('샤넬')) {
        analysis.softScores.tag_elegant = 0.95;
    }
    if (lowerPrompt.includes('스트릿') || lowerPrompt.includes('street') || lowerPrompt.includes('거리')) {
        analysis.softScores.tag_street = 0.9;
    }
    
    // Energy keywords
    if (lowerPrompt.includes('파워') || lowerPrompt.includes('powerful') || lowerPrompt.includes('강렬')) {
        analysis.softScores.tag_powerful = 0.9;
    }
    if (lowerPrompt.includes('부드') || lowerPrompt.includes('soft') || lowerPrompt.includes('서정')) {
        analysis.softScores.tag_soft = 0.9;
    }
    if (lowerPrompt.includes('활기') || lowerPrompt.includes('energetic') || 
        lowerPrompt.includes('에너지') || lowerPrompt.includes('신나')) {
        analysis.softScores.tag_energetic = 0.9;
    }
    if (lowerPrompt.includes('차분') || lowerPrompt.includes('calm') || lowerPrompt.includes('절제')) {
        analysis.softScores.tag_calm = 0.9;
    }
    
    // Style keywords
    if (lowerPrompt.includes('트렌디') || lowerPrompt.includes('trendy') || lowerPrompt.includes('최신')) {
        analysis.softScores.tag_trendy = 0.85;
    }
    if (lowerPrompt.includes('클래식') || lowerPrompt.includes('classic') || lowerPrompt.includes('정통')) {
        analysis.softScores.tag_classic = 0.85;
    }
    if (lowerPrompt.includes('실험') || lowerPrompt.includes('experimental') || 
        lowerPrompt.includes('전위') || lowerPrompt.includes('기괴')) {
        analysis.softScores.tag_experimental = 0.9;
    }
    if (lowerPrompt.includes('광고') || lowerPrompt.includes('commercial') || lowerPrompt.includes('CF')) {
        analysis.softScores.tag_commercial = 0.8;
    }
    
    // Visual keywords
    if (lowerPrompt.includes('탄탄') || lowerPrompt.includes('athletic') || lowerPrompt.includes('운동')) {
        analysis.softScores.tag_athletic = 0.85;
    }
    if (lowerPrompt.includes('슬림') || lowerPrompt.includes('slim') || lowerPrompt.includes('날씬')) {
        analysis.softScores.tag_slim = 0.85;
    }
    if (lowerPrompt.includes('키') || lowerPrompt.includes('tall') || lowerPrompt.includes('비율')) {
        analysis.softScores.tag_tall = 0.9;
    }
    if (lowerPrompt.includes('젊') || lowerPrompt.includes('young') || lowerPrompt.includes('풋풋')) {
        analysis.softScores.tag_young = 0.85;
    }
    if (lowerPrompt.includes('성숙') || lowerPrompt.includes('mature') || lowerPrompt.includes('노련')) {
        analysis.softScores.tag_mature = 0.85;
    }
    
    // Skill keywords
    if (lowerPrompt.includes('기술') || lowerPrompt.includes('technical') || lowerPrompt.includes('고난도')) {
        analysis.softScores.tag_technical = 0.9;
    }
    
    // Cold/Warm vibe (냉미남, 따뜻한 등)
    if (lowerPrompt.includes('냉') || lowerPrompt.includes('차가') || lowerPrompt.includes('cold')) {
        analysis.softScores.warmCold = 0.9; // high value = cold
    }
    if (lowerPrompt.includes('따뜻') || lowerPrompt.includes('warm') || lowerPrompt.includes('포근')) {
        analysis.softScores.warmCold = 0.1; // low value = warm
    }
    
    // Robotic/Organic (로봇, 기계적 등)
    if (lowerPrompt.includes('로봇') || lowerPrompt.includes('robotic') || 
        lowerPrompt.includes('기계') || lowerPrompt.includes('로보팅')) {
        analysis.softScores.organicRobotic = 0.95;
        analysis.softScores.roboting = 0.9;
    }
    
    // Traditional/Modern (전통, 한복, 국악 등)
    if (lowerPrompt.includes('전통') || lowerPrompt.includes('한복') || 
        lowerPrompt.includes('국악') || lowerPrompt.includes('traditional')) {
        analysis.softScores.traditionalModern = 0.1; // low = traditional
        analysis.softScores.koreanTraditional = 0.9;
    }
    if (lowerPrompt.includes('현대') || lowerPrompt.includes('모던') || lowerPrompt.includes('modern')) {
        analysis.softScores.traditionalModern = 0.95;
    }
    
    // Default tags if nothing matched
    if (Object.keys(analysis.softScores).length === 0) {
        analysis.softScores.tag_commercial = 0.7;
        analysis.softScores.tag_trendy = 0.6;
        analysis.softScores.tag_energetic = 0.6;
    }
    
    console.log('🤖 AI Analysis Result:', analysis);
    return analysis;
}

// ===== Forms =====
function initForms() {
    // Casting Request Form
    const castingForm = document.getElementById('castingForm');
    if (castingForm) {
        castingForm.addEventListener('submit', handleCastingSubmit);
    }

    // Artist Registration Form
    const artistForm = document.getElementById('artistForm');
    if (artistForm) {
        artistForm.addEventListener('submit', handleArtistSubmit);
    }
    
    // Initialize signup form
    initSignUpForm();
    
    // Initialize range sliders with live value display
    initRangeSliders();
}

// Initialize Sign Up Form with role-based fields
function initSignUpForm() {
    const signUpForm = document.getElementById('signUpStep2');
    if (!signUpForm) {
        console.warn('⚠️ Sign up form (step 2) not found');
        return;
    }
    
    console.log('✅ Initializing sign up form');
    
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('📝 Sign up form submitted');
        
        const email = document.getElementById('signUpEmail').value;
        const password = document.getElementById('signUpPassword').value;
        const passwordConfirm = document.getElementById('signUpPasswordConfirm').value;
        const userType = document.getElementById('selectedUserType').value;
        
        // Validate passwords match
        if (password !== passwordConfirm) {
            showToast('비밀번호가 일치하지 않습니다', 'error');
            return;
        }
        
        // Collect profile data based on user type (필수 필드만)
        let profileData = {};
        
        if (userType === 'client') {
            const nameField = document.getElementById('clientName');
            const phoneField = document.getElementById('clientPhone');
            
            if (!nameField || !phoneField) {
                showToast('필수 정보를 입력해주세요', 'error');
                return;
            }
            
            profileData = {
                name: nameField.value.trim(),
                phone: phoneField.value.trim(),
                role: 'client'
            };
        } else if (userType === 'artist') {
            const stageNameField = document.getElementById('artistStageName');
            const phoneField = document.getElementById('artistPhone');
            
            if (!stageNameField || !phoneField) {
                showToast('필수 정보를 입력해주세요', 'error');
                return;
            }
            
            profileData = {
                stageName: stageNameField.value.trim(),
                phone: phoneField.value.trim(),
                role: 'artist'
            };
        }
        
        console.log('📝 Signup data:', { email, userType, profileData });
        
        // Call signUp function
        if (typeof signUp === 'function') {
            try {
                const result = await signUp(email, password, userType, profileData);
                console.log('📝 Signup result:', result);
                
                if (result.success) {
                    console.log('✅ Signup successful');
                    
                    // Close modal
                    closeModal('loginModal');
                    
                    // Redirect to appropriate dashboard
                    setTimeout(() => {
                        if (result.userType === 'artist') {
                            window.location.href = 'artist-dashboard.html';
                        } else {
                            window.location.href = 'client-dashboard.html';
                        }
                    }, 1000);
                } else {
                    console.error('❌ Signup failed:', result);
                }
            } catch (error) {
                console.error('❌ Signup exception:', error);
                showToast('회원가입 중 오류가 발생했습니다', 'error');
            }
        } else {
            console.error('❌ signUp function not available');
            showToast('인증 시스템을 사용할 수 없습니다', 'error');
        }
    });
}

// Make initSignUpForm globally accessible
window.initSignUpForm = initSignUpForm;

/**
 * Initialize range sliders to display live values
 */
function initRangeSliders() {
    const sliders = [
        'freshDark', 'powerfulSoft', 'standardTrendy'
    ];
    
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(`${id}-value`);
        
        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value;
            });
        }
    });
}

async function handleCastingSubmit(e) {
    e.preventDefault();

    if (state.isLoading) return;
    state.isLoading = true;

    const formData = new FormData(e.target);
    const aiPrompt = formData.get('aiPrompt');
    
    try {
        // Step 1: AI Analysis
        showToast('🤖 AI가 요청을 분석하고 있습니다...', 'info');
        const analyzedTags = await analyzePromptWithAI(aiPrompt);
        
        // Step 2: Find matching dancers
        const engine = new AIMatchingEngine();
        const matchResults = engine.findMatches(analyzedTags, state.dancers, 5);
        const formattedResults = engine.formatResults(matchResults);
        
        // Step 3: Display results
        displayMatchResults(formattedResults, analyzedTags);
        
        // Step 4: Save to database
        const data = {
            client_name: formData.get('clientName'),
            client_email: formData.get('clientEmail'),
            client_phone: formData.get('clientPhone'),
            event_date: formData.get('eventDate'),
            event_type: formData.get('eventType'),
            dancer_count: parseInt(formData.get('dancerCount')),
            budget: parseInt(formData.get('budget')) * 10000,
            ai_prompt: aiPrompt,
            analyzed_tags: JSON.stringify(analyzedTags),
            recommended_dancers: formattedResults.map(r => r.id),
            message: formData.get('message') || ''
        };

        const response = await fetch('tables/casting_requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast('✅ AI 매칭이 완료되었습니다! 추천 댄서를 확인하세요.', 'success');
            e.target.reset();
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
        state.isLoading = false;
    }
}

/**
 * Display AI match results
 */
function displayMatchResults(results, analyzedTags) {
    const resultsModal = document.getElementById('resultsModal');
    const resultsContent = document.getElementById('resultsContent');
    
    if (!resultsModal || !resultsContent) {
        console.error('Results modal not found');
        return;
    }
    
    // Create results HTML
    const resultsHTML = `
        <div class="ai-analysis-summary">
            <h3>🤖 AI 분석 결과</h3>
            <div class="analyzed-tags">
                ${Object.entries(analyzedTags)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([tag, value]) => `
                        <div class="tag-chip">
                            <span class="tag-name">${tag.replace('tag_', '')}</span>
                            <span class="tag-value">${Math.round(value * 100)}%</span>
                        </div>
                    `).join('')}
            </div>
        </div>
        
        <div class="match-results">
            <h3>✨ 추천 댄서 (Top ${results.length})</h3>
            <div class="results-grid">
                ${results.map(result => `
                    <div class="result-card" data-dancer-id="${result.id}">
                        <div class="result-rank">#${result.rank}</div>
                        <img src="${result.image_url}" alt="${result.name}" class="result-image">
                        <div class="result-info">
                            <div class="result-header">
                                <h4>${result.name}</h4>
                                <span class="result-name-en">${result.name_en}</span>
                            </div>
                            <div class="result-match">
                                <span class="match-emoji">${result.matchLevel.emoji}</span>
                                <span class="match-score">${result.matchScore}점</span>
                                <span class="match-label">${result.matchLevel.label}</span>
                            </div>
                            <div class="result-details">
                                <p><i class="fas fa-music"></i> ${result.specialty}</p>
                                <p><i class="fas fa-birthday-cake"></i> ${result.age}세 · <i class="fas fa-ruler-vertical"></i> ${result.height}cm</p>
                                <p><i class="fas fa-star"></i> ${result.rating} / 5.0</p>
                            </div>
                            <div class="result-tags">
                                ${result.details.topMatchingTags.map(t => `
                                    <span class="result-tag">${t.tag}: ${t.match}</span>
                                `).join('')}
                            </div>
                            
                            <!-- Contact Section -->
                            <div class="result-contact">
                                ${window.isContactUnlocked(result.id) ? `
                                    <div class="contact-unlocked">
                                        <h5><i class="fas fa-unlock"></i> 연락처</h5>
                                        ${result.phone ? `<p><i class="fas fa-phone"></i> ${result.phone}</p>` : ''}
                                        ${result.email ? `<p><i class="fas fa-envelope"></i> ${result.email}</p>` : ''}
                                        ${result.instagram ? `<p><i class="fab fa-instagram"></i> ${result.instagram}</p>` : ''}
                                    </div>
                                ` : `
                                    <button class="btn btn-outline btn-unlock-contact" onclick="handleUnlockContact('${result.id}')">
                                        <i class="fas fa-lock"></i>
                                        연락처 보기 (1 Credit)
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    resultsContent.innerHTML = resultsHTML;
    
    // Close casting modal
    closeAllModals();
    
    // Open results modal
    resultsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function handleUnlockContact(dancerId) {
    const unlocked = await window.unlockDancerContact(dancerId);
    
    if (unlocked) {
        // Reload results to show unlocked contact
        const resultCard = document.querySelector(`[data-dancer-id="${dancerId}"]`);
        if (resultCard) {
            const dancer = state.dancers.find(d => d.id === dancerId);
            if (dancer) {
                const contactSection = resultCard.querySelector('.result-contact');
                contactSection.innerHTML = `
                    <div class="contact-unlocked">
                        <h5><i class="fas fa-unlock"></i> 연락처</h5>
                        ${dancer.phone ? `<p><i class="fas fa-phone"></i> ${dancer.phone}</p>` : ''}
                        ${dancer.email ? `<p><i class="fas fa-envelope"></i> ${dancer.email}</p>` : ''}
                        ${dancer.instagram ? `<p><i class="fab fa-instagram"></i> ${dancer.instagram}</p>` : ''}
                    </div>
                `;
            }
        }
    }
}

// Export to global scope
window.handleUnlockContact = handleUnlockContact;

async function handleArtistSubmit(e) {
    e.preventDefault();

    if (state.isLoading) return;
    state.isLoading = true;

    const formData = new FormData(e.target);
    
    // Helper: get multi-select values as comma-separated string
    const getMultiSelectValue = (name) => {
        const select = e.target.querySelector(`[name="${name}"]`);
        if (!select || !select.multiple) return formData.get(name) || '';
        return Array.from(select.selectedOptions).map(opt => opt.value).join(',');
    };
    
    // Helper: get checkbox value
    const getCheckboxValue = (name) => {
        return e.target.querySelector(`[name="${name}"]`)?.checked || false;
    };
    
    // Helper: get number or default
    const getNumber = (name, defaultVal = 0) => {
        const val = formData.get(name);
        return val ? parseInt(val) : defaultVal;
    };
    
    const data = {
        // Basic info
        name: formData.get('artistName'),
        email: formData.get('artistEmail'),
        phone: formData.get('artistPhone'),
        specialty: formData.get('specialty'),
        videoLink: formData.get('videoLink'),
        desiredPrice: getNumber('desiredPrice') * 10000,
        
        // P0 - Visual Profile
        gender: formData.get('gender'),
        heightCm: getNumber('heightCm'),
        bodyFrame: formData.get('bodyFrame'),
        skinTone: formData.get('skinTone'),
        hairStyle: getMultiSelectValue('hairStyle'),
        hairColor: getMultiSelectValue('hairColor'),
        
        // P1 - Detailed Visual
        shoulderType: formData.get('shoulderType') || '',
        hairLength: formData.get('hairLength') || '',
        skinSensitivity: formData.get('skinSensitivity') || '',
        faceVibe: getMultiSelectValue('faceVibe'),
        silhouette: formData.get('silhouette') || '',
        visualAge: formData.get('visualAge') || '',
        
        // P0 - Acting & Vocal Skills
        acting: getNumber('acting'),
        emotionalActing: getNumber('emotionalActing'),
        singing: getNumber('singing'),
        rhythmAccuracy: getNumber('rhythmAccuracy'),
        
        // P1 - Additional Skills
        characterActing: getNumber('characterActing'),
        facialExpression: getNumber('facialExpression'),
        propHandling: getNumber('propHandling'),
        acrobatics: getNumber('acrobatics'),
        
        // P1 - Style Tags
        warmCold: getNumber('warmCold'),
        organicRobotic: getNumber('organicRobotic'),
        traditionalModern: getNumber('traditionalModern'),
        
        // P0/P2 - Boolean Style Tags
        kidsFriendly: getCheckboxValue('kidsFriendly'),
        futuristicVibe: getCheckboxValue('futuristicVibe'),
        horrorReady: getCheckboxValue('horrorReady'),
        highEnergy: getCheckboxValue('highEnergy'),
        gamerNerd: getCheckboxValue('gamerNerd'),
        cameraFriendly: getCheckboxValue('cameraFriendly'),
        
        // P1 - Special Experience
        sfxMakeupOk: getCheckboxValue('sfxMakeupOk'),
        longMakeupOk: getCheckboxValue('longMakeupOk'),
        willingToWearLED: getCheckboxValue('willingToWearLED'),
        willingToWearSFX: getCheckboxValue('willingToWearSFX'),
        cosplayExperience: getCheckboxValue('cosplayExperience'),
        
        // P2 - Cosplay & Costume
        cosplayFandoms: getMultiSelectValue('cosplayFandoms'),
        specialCostumeExperience: getMultiSelectValue('specialCostumeExperience'),
        
        // P2 - Teaching Capability
        canTeach: getCheckboxValue('canTeach'),
        teachingExperience: formData.get('teachingExperience') || '',
        approachability: getNumber('approachability'),
        communicationSkill: getNumber('communicationSkill'),
        
        // P2 - Special Dance Skills
        koreanTraditional: getNumber('koreanTraditional'),
        roboting: getNumber('roboting'),
        animation: getNumber('animation'),
        tutting: getNumber('tutting')
    };

    try {
        const response = await fetch('tables/artist_registrations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast('✅ 아티스트 등록이 완료되었습니다! 검수 후 24시간 내에 연락드리겠습니다.', 'success');
            e.target.reset();
            closeAllModals();
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ 등록 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
        state.isLoading = false;
    }
}

// ===== Toast Notification =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// ===== Scroll Animations =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    document.querySelectorAll('.feature-item, .portfolio-item, .testimonial-card, .cta-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

// ===== Admin: Add Dancer Function =====
async function addDancer(dancerData) {
    try {
        const response = await fetch('tables/dancers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dancerData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('댄서 추가 성공:', result);
            await loadDancers();
            initInfiniteSlider();
            return result;
        } else {
            throw new Error('Failed to add dancer');
        }
    } catch (error) {
        console.error('댄서 추가 실패:', error);
        throw error;
    }
}

window.addDancer = addDancer;

// ===== Authentication Form Handlers =====
function initAuthForms() {
    console.log('🔐 Initializing auth forms...');
    
    // Sign In Form
    const signInForm = document.getElementById('signInForm');
    console.log('📝 SignIn form found:', !!signInForm);
    
    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('🔓 Sign in form submitted');
            
            const email = document.getElementById('signInEmail').value;
            const password = document.getElementById('signInPassword').value;
            
            console.log('🔐 Login attempt:', email);
            
            // Check if auth functions are available
            if (typeof signIn === 'function') {
                console.log('✅ signIn function available');
                const result = await signIn(email, password);
                
                if (result.success) {
                    // Close modal
                    closeModal('loginModal');
                    
                    // Update state
                    state.currentUser = { 
                        email: email, 
                        credits: 10 
                    };
                }
            } else {
                console.error('❌ signIn function not available');
                showToast('인증 시스템을 사용할 수 없습니다', 'error');
            }
        });
        console.log('✅ Sign in form handler attached');
    }
    
    // Sign Up Form
    const signUpForm = document.getElementById('signUpForm');
    console.log('📝 SignUp form found:', !!signUpForm);
    
    if (signUpForm) {
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('📝 Sign up form submitted');
            
            const email = document.getElementById('signUpEmail').value;
            const password = document.getElementById('signUpPassword').value;
            const passwordConfirm = document.getElementById('signUpPasswordConfirm').value;
            const role = document.querySelector('input[name="userRole"]:checked')?.value || 'client';
            
            console.log('📝 Signup attempt:', email, 'as', role);
            
            // Validate passwords match
            if (password !== passwordConfirm) {
                showToast('비밀번호가 일치하지 않습니다', 'error');
                return;
            }
            
            // Check if auth functions are available
            if (typeof signUp === 'function') {
                console.log('✅ signUp function available');
                const result = await signUp(email, password, role);
                
                if (result.success) {
                    // Switch to login tab
                    switchAuthTab('signin');
                }
            } else {
                console.error('❌ signUp function not available');
                showToast('인증 시스템을 사용할 수 없습니다', 'error');
            }
        });
        console.log('✅ Sign up form handler attached');
    }
    
    console.log('✅ Auth forms initialized');
}

// Switch between sign in and sign up tabs
function switchAuthTab(tab) {
    const signInTab = document.querySelector('.auth-tab[data-tab="signin"]');
    const signUpTab = document.querySelector('.auth-tab[data-tab="signup"]');
    const signInForm = document.getElementById('signInForm');
    const signUpStep1 = document.getElementById('signUpStep1');
    const signUpStep2 = document.getElementById('signUpStep2');
    const modalTitle = document.getElementById('authModalTitle');
    const modalSubtitle = document.getElementById('authModalSubtitle');
    
    if (tab === 'signin') {
        signInTab?.classList.add('active');
        signUpTab?.classList.remove('active');
        signInForm?.classList.add('active');
        if (signUpStep1) signUpStep1.style.display = 'none';
        if (signUpStep2) signUpStep2.style.display = 'none';
        
        if (modalTitle) modalTitle.textContent = 'UTOPIA X 로그인';
        if (modalSubtitle) modalSubtitle.textContent = '이메일로 간편하게 시작하세요';
    } else {
        signInTab?.classList.remove('active');
        signUpTab?.classList.add('active');
        signInForm?.classList.remove('active');
        if (signUpStep1) signUpStep1.style.display = 'block';
        if (signUpStep2) signUpStep2.style.display = 'none';
        
        if (modalTitle) modalTitle.textContent = '회원가입';
        if (modalSubtitle) modalSubtitle.textContent = '유형을 선택하고 시작하세요';
    }
}

// User type selection for signup
function selectUserType(type) {
    console.log('🎯 selectUserType called with:', type);
    
    const step1 = document.getElementById('signUpStep1');
    const step2 = document.getElementById('signUpStep2');
    const selectedUserType = document.getElementById('selectedUserType');
    const clientFields = document.getElementById('clientFields');
    const artistFields = document.getElementById('artistFields');
    const step2Title = document.getElementById('step2Title');
    const step2Subtitle = document.getElementById('step2Subtitle');
    
    // Debug: Log element status
    console.log('Step1:', step1 ? 'found' : 'NOT FOUND');
    console.log('Step2:', step2 ? 'found' : 'NOT FOUND');
    console.log('ClientFields:', clientFields ? 'found' : 'NOT FOUND');
    console.log('ArtistFields:', artistFields ? 'found' : 'NOT FOUND');
    
    // Validate required elements
    if (!step1 || !step2) {
        console.error('❌ Required signup steps not found!');
        return;
    }
    
    if (!clientFields || !artistFields) {
        console.error('❌ Required field containers not found!');
        return;
    }
    
    // Update hidden field
    if (selectedUserType) {
        selectedUserType.value = type;
        console.log('✅ Set selectedUserType to:', type);
    }
    
    // Show/hide appropriate fields
    if (type === 'client') {
        clientFields.style.display = 'block';
        artistFields.style.display = 'none';
        
        // Make client fields required
        document.getElementById('clientName').required = true;
        document.getElementById('clientPhone').required = true;
        
        // Remove artist fields required
        document.getElementById('artistStageName').required = false;
        document.getElementById('artistPhone').required = false;
        
        step2Title.textContent = '클라이언트 정보 입력';
        step2Subtitle.textContent = '필수 정보만 입력해주세요 (빠른 가입)';
    } else {
        clientFields.style.display = 'none';
        artistFields.style.display = 'block';
        
        // Remove client fields required
        document.getElementById('clientName').required = false;
        document.getElementById('clientPhone').required = false;
        
        // Make artist fields required
        document.getElementById('artistStageName').required = true;
        document.getElementById('artistPhone').required = true;
        
        step2Title.textContent = '아티스트 정보 입력';
        step2Subtitle.textContent = '필수 정보만 입력해주세요 (빠른 가입)';
    }
    
    // Switch to step 2
    console.log('🔄 Switching to Step 2...');
    step1.style.display = 'none';
    step2.style.display = 'block';
    console.log('✅ Step 1 hidden, Step 2 visible');
    
    // Add visual feedback to selected card
    document.querySelectorAll('.user-type-card').forEach(card => {
        if (card.dataset.type === type) {
            card.style.borderColor = 'var(--primary-purple)';
            card.style.transform = 'scale(1.02)';
            console.log('✅ Highlighted card:', type);
        } else {
            card.style.borderColor = 'var(--border-color)';
            card.style.transform = 'scale(1)';
        }
    });
    
    console.log('✅ User type selection complete');
}

// Back to step 1
function backToStep1() {
    const step1 = document.getElementById('signUpStep1');
    const step2 = document.getElementById('signUpStep2');
    
    step1.style.display = 'block';
    step2.style.display = 'none';
    
    // Reset form
    document.getElementById('signUpStep2').reset();
}

// Make functions globally accessible
window.switchAuthTab = switchAuthTab;
window.selectUserType = selectUserType;
window.backToStep1 = backToStep1;

// ===== User Menu =====
function initUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenuDropdown = document.getElementById('userMenuDropdown');
    const btnDashboard = document.getElementById('btnDashboard');
    const btnLogout = document.getElementById('btnLogout');
    
    console.log('🎯 initUserMenu called');
    console.log('  - userMenuBtn:', userMenuBtn ? 'found' : 'NOT FOUND');
    console.log('  - userMenuDropdown:', userMenuDropdown ? 'found' : 'NOT FOUND');
    console.log('  - btnDashboard:', btnDashboard ? 'found' : 'NOT FOUND');
    
    // Toggle dropdown on button click
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ User menu button clicked!');
            
            // CRITICAL: Use synchronous sessionStorage check only (FAST!)
            // No await, no async delay - instant response
            const userEmail = sessionStorage.getItem('userEmail');
            const isLoggedIn = !!(userEmail && userEmail !== 'Login');
            
            console.log('✅ User logged in:', isLoggedIn, '| Email:', userEmail);
            
            // If not logged in, show login modal immediately
            if (!isLoggedIn) {
                console.log('❌ User not logged in, showing login modal');
                openLoginModal(); // Use dedicated login function
                return;
            }
            
            // If logged in, toggle dropdown
            if (!userMenuDropdown) {
                console.error('❌ userMenuDropdown not found!');
                return;
            }
            
            const isShown = userMenuDropdown.classList.contains('show');
            userMenuDropdown.classList.toggle('show');
            
            console.log('🎉 Dropdown toggled:', isShown ? 'hidden' : 'shown');
        });
        console.log('✅ User menu button click handler attached (SYNC MODE)');
    } else {
        console.error('❌ User menu button NOT FOUND!');
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            userMenuDropdown?.classList.remove('show');
        }
    });
    
    // Dashboard button click handler
    if (btnDashboard) {
        btnDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🎯 Dashboard button clicked!');
            userMenuDropdown?.classList.remove('show');
            navigateToDashboard();
        });
        console.log('✅ Dashboard button click handler attached');
    } else {
        console.warn('⚠️ Dashboard button NOT FOUND');
    }
    
    // My Profile button
    const btnMyProfile = document.getElementById('btnMyProfile');
    if (btnMyProfile) {
        btnMyProfile.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('👤 My Profile clicked!');
            userMenuDropdown?.classList.remove('show');
            
            // Call function from credit-system.js
            if (typeof showMyProfile === 'function') {
                showMyProfile();
            } else {
                showToast('내 정보 페이지는 준비 중입니다', 'info');
            }
        });
        console.log('✅ My Profile button handler attached');
    }
    
    // Purchase History button
    const btnPurchaseHistory = document.getElementById('btnPurchaseHistory');
    if (btnPurchaseHistory) {
        btnPurchaseHistory.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('📜 Purchase History clicked!');
            userMenuDropdown?.classList.remove('show');
            
            // Call function from credit-system.js
            if (typeof showPurchaseHistory === 'function') {
                showPurchaseHistory();
            } else {
                showToast('구매 내역 페이지는 준비 중입니다', 'info');
            }
        });
        console.log('✅ Purchase History button handler attached');
    }
    
    // Unlocked Dancers button
    const btnUnlockedDancers = document.getElementById('btnUnlockedDancers');
    if (btnUnlockedDancers) {
        btnUnlockedDancers.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔓 Unlocked Dancers clicked!');
            userMenuDropdown?.classList.remove('show');
            
            // Call function from credit-system.js
            if (typeof showUnlockedDancers === 'function') {
                showUnlockedDancers();
            } else {
                showToast('잠금 해제 댄서 페이지는 준비 중입니다', 'info');
            }
        });
        console.log('✅ Unlocked Dancers button handler attached');
    }
    
    // My Profile button
    const btnMyProfile = document.getElementById('btnMyProfile');
    if (btnMyProfile) {
        btnMyProfile.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('👤 My Profile clicked!');
            userMenuDropdown?.classList.remove('show');
            
            showToast('내 정보 페이지는 준비 중입니다', 'info');
            // TODO: Open profile modal or navigate to profile page
            // openModal('profileModal');
        });
        console.log('✅ My Profile button handler attached');
    }
    
    // Purchase History button
    const btnPurchaseHistory = document.getElementById('btnPurchaseHistory');
    if (btnPurchaseHistory) {
        btnPurchaseHistory.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('📜 Purchase History clicked!');
            userMenuDropdown?.classList.remove('show');
            
            showToast('구매 내역 페이지는 준비 중입니다', 'info');
            // TODO: Open purchase history modal
            // openModal('purchaseHistoryModal');
        });
        console.log('✅ Purchase History button handler attached');
    }
    
    // Unlocked Dancers button
    const btnUnlockedDancers = document.getElementById('btnUnlockedDancers');
    if (btnUnlockedDancers) {
        btnUnlockedDancers.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔓 Unlocked Dancers clicked!');
            userMenuDropdown?.classList.remove('show');
            
            showToast('잠금 해제 댄서 페이지는 준비 중입니다', 'info');
            // TODO: Open unlocked dancers modal
            // openModal('unlockedDancersModal');
        });
        console.log('✅ Unlocked Dancers button handler attached');
    }
    
    // Credit Charge button
    const btnCreditCharge = document.getElementById('btnCreditCharge');
    if (btnCreditCharge) {
        btnCreditCharge.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('💳 Credit Charge clicked!');
            userMenuDropdown?.classList.remove('show');
            
            // Open credit charge modal
            openModal('creditCharge');
        });
        console.log('✅ Credit Charge button handler attached');
    }
    
    // Logout button
    if (btnLogout) {
        btnLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('🚪 Logout button clicked!');
            
            // Close dropdown immediately
            if (userMenuDropdown) {
                userMenuDropdown.classList.remove('show');
                userMenuDropdown.style.display = '';
                userMenuDropdown.style.opacity = '';
                userMenuDropdown.style.visibility = '';
                userMenuDropdown.style.transform = '';
                userMenuDropdown.style.pointerEvents = '';
            }
            
            // Perform logout
            if (typeof signOut === 'function') {
                await signOut();
            } else {
                // Fallback logout
                sessionStorage.clear();
                localStorage.clear();
                showToast('로그아웃되었습니다', 'success');
                setTimeout(() => {
                    location.reload();
                }, 500);
            }
        });
        console.log('✅ Logout button click handler attached');
    } else {
        console.warn('⚠️ Logout button NOT FOUND');
    }
    
    console.log('✅ User menu initialized');
}

// Navigate to appropriate dashboard based on user role
async function navigateToDashboard() {
    // First, try to get user from Supabase
    if (typeof window.supabase !== 'undefined') {
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            
            if (user && user.user_metadata) {
                const userType = user.user_metadata.user_type || user.user_metadata.userRole;
                
                console.log('🎯 Navigating to dashboard for user type:', userType);
                
                if (userType === 'artist' || userType === 'dancer') {
                    window.location.href = 'artist-dashboard.html';
                    return;
                } else if (userType === 'client' || userType === 'host') {
                    window.location.href = 'client-dashboard.html';
                    return;
                }
            }
        } catch (error) {
            console.error('Error getting user from Supabase:', error);
        }
    }
    
    // Fallback to sessionStorage
    const userRole = sessionStorage.getItem('userRole');
    const userType = sessionStorage.getItem('userType');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (!userEmail) {
        showToast('로그인이 필요합니다', 'error');
        return;
    }
    
    console.log('🎯 Navigating to dashboard (fallback) - role:', userRole, 'type:', userType);
    
    if (userRole === 'artist' || userType === 'artist' || userType === 'dancer') {
        window.location.href = 'artist-dashboard.html';
    } else {
        // Default to client dashboard
        window.location.href = 'client-dashboard.html';
    }
}

// Make navigateToDashboard globally accessible
window.navigateToDashboard = navigateToDashboard;

// ===== Console Art =====
console.log('%c🎭 UTOPIA X with AI Matching', 'color: #9D4EDD; font-size: 24px; font-weight: bold;');
console.log('%cAI 기반 댄서 캐스팅 플랫폼', 'color: #E91E84; font-size: 14px;');
console.log('%cMade with ❤️ in Seoul, Korea', 'color: #6366F1; font-size: 12px;');
console.log('%c\n관리자 기능: 댄서 추가하려면 addDancer(데이터) 함수를 사용하세요', 'color: #10b981; font-size: 12px;');
