// 협력 브랜드 무한 슬라이더 - 끊김 없는 버전
console.log('🎨 Brand Slider Loading...');

document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('brandSlider');
    
    if (!slider) {
        console.warn('⚠️ Brand slider not found');
        return;
    }
    
    console.log('✅ Brand slider found');
    
    // 원본 로고들 저장
    const originalLogos = Array.from(slider.children);
    const logoCount = originalLogos.length;
    console.log(`📦 Found ${logoCount} original logos`);
    
    // 로고를 충분히 복제 (원본 + 3번 복제 = 총 4세트)
    // 이렇게 하면 화면에 항상 충분한 로고가 보임
    for (let i = 0; i < 3; i++) {
        originalLogos.forEach(logo => {
            const clone = logo.cloneNode(true);
            slider.appendChild(clone);
        });
    }
    
    console.log(`✅ Logos cloned - Total: ${slider.children.length}`);
    
    // 애니메이션 설정
    let position = 0;
    const speed = 0.5; // 픽셀/프레임
    let isRunning = true;
    let animationId = null;
    
    // 한 세트의 너비 계산 (정확하게)
    function calculateSetWidth() {
        const firstLogo = slider.children[0];
        const logoRect = firstLogo.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(slider);
        const gap = parseFloat(computedStyle.gap) || 50;
        
        const singleLogoWidth = logoRect.width + gap;
        const setWidth = singleLogoWidth * logoCount; // 원본 세트 너비만
        
        console.log(`📏 Single logo width: ${logoRect.width}px`);
        console.log(`📏 Gap: ${gap}px`);
        console.log(`📏 Logo count: ${logoCount}`);
        console.log(`📏 Set width: ${setWidth}px`);
        
        return setWidth;
    }
    
    const setWidth = calculateSetWidth();
    
    // 애니메이션 함수
    function animate() {
        if (!isRunning) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        
        // 왼쪽으로 이동
        position -= speed;
        
        // 한 세트만큼 이동했으면 position을 0으로 리셋
        // 이렇게 하면 끊김 없이 무한 반복
        if (Math.abs(position) >= setWidth) {
            position = 0;
        }
        
        // transform 적용
        slider.style.transform = `translateX(${position}px)`;
        
        // 다음 프레임 요청
        animationId = requestAnimationFrame(animate);
    }
    
    // 애니메이션 시작
    animate();
    console.log('🎬 Animation started!');
    
    // 호버 시 일시정지
    const wrapper = document.querySelector('.brand-slider-wrapper');
    if (wrapper) {
        wrapper.addEventListener('mouseenter', () => {
            isRunning = false;
            console.log('⏸️ Animation paused');
        });
        
        wrapper.addEventListener('mouseleave', () => {
            isRunning = true;
            console.log('▶️ Animation resumed');
        });
    }
    
    // 윈도우 리사이즈 시 재계산 (옵션)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newSetWidth = calculateSetWidth();
            console.log(`🔄 Window resized - New set width: ${newSetWidth}px`);
        }, 250);
    });
});
