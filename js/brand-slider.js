// 협력 브랜드 무한 슬라이더 - 완벽하게 끊김 없는 버전
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
    
    // 로고를 충분히 많이 복제 (원본 + 5번 복제 = 총 6세트)
    // 많이 복제할수록 리셋이 덜 보임
    for (let i = 0; i < 5; i++) {
        originalLogos.forEach(logo => {
            const clone = logo.cloneNode(true);
            slider.appendChild(clone);
        });
    }
    
    console.log(`✅ Logos cloned - Total: ${slider.children.length}`);
    
    // 애니메이션 설정
    let position = 0;
    const speed = 0.5; // 픽셀/프레임 (부드러운 속도)
    
    // 한 세트의 너비 계산
    function calculateSetWidth() {
        // 약간의 딜레이를 주고 정확한 너비 측정
        setTimeout(() => {
            const firstLogo = slider.children[0];
            if (!firstLogo) return 0;
            
            const logoRect = firstLogo.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(slider);
            const gap = parseFloat(computedStyle.gap) || 50;
            
            const singleLogoWidth = logoRect.width + gap;
            const setWidth = singleLogoWidth * logoCount;
            
            console.log(`📏 Single logo width: ${logoRect.width}px`);
            console.log(`📏 Gap: ${gap}px`);
            console.log(`📏 Logo count: ${logoCount}`);
            console.log(`📏 Set width: ${setWidth}px`);
            
            return setWidth;
        }, 100);
        
        // 임시로 기본값 반환
        return (150 + 50) * logoCount; // 150px 로고 + 50px gap
    }
    
    const setWidth = calculateSetWidth();
    
    // 애니메이션 함수 - 절대 멈추지 않음
    function animate() {
        // 왼쪽으로 계속 이동
        position -= speed;
        
        // 한 세트만큼 이동했으면 position을 0으로 리셋
        // 복제가 충분히 많아서 리셋이 보이지 않음
        if (Math.abs(position) >= setWidth) {
            position = 0;
        }
        
        // transform 적용 (transition 없음!)
        slider.style.transform = `translateX(${position}px)`;
        
        // 다음 프레임 계속 요청
        requestAnimationFrame(animate);
    }
    
    // 애니메이션 시작 - 절대 멈추지 않음!
    animate();
    console.log('🎬 Animation started! (Never stops)');
});
