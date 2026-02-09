// 협력 브랜드 무한 슬라이더 - 완전히 새로 만듦
console.log('🎨 Brand Slider Loading...');

document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('brandSlider');
    
    if (!slider) {
        console.warn('⚠️ Brand slider not found');
        return;
    }
    
    console.log('✅ Brand slider found');
    
    // 로고들을 가져오기
    const logos = Array.from(slider.children);
    console.log(`📦 Found ${logos.length} logos`);
    
    // 로고들을 3번 복제 (부드러운 무한 루프를 위해)
    for (let i = 0; i < 2; i++) {
        logos.forEach(logo => {
            const clone = logo.cloneNode(true);
            slider.appendChild(clone);
        });
    }
    
    console.log(`✅ Logos cloned - Total: ${slider.children.length}`);
    
    // 애니메이션 변수
    let position = 0;
    const speed = 0.8; // 픽셀/프레임 (낮을수록 느림)
    let isRunning = true;
    
    // 한 세트의 너비 계산
    const logoWidth = 180 + 50; // width + gap
    const setWidth = logoWidth * logos.length;
    
    console.log(`📏 Set width: ${setWidth}px`);
    
    // 애니메이션 함수
    function animate() {
        if (!isRunning) return;
        
        position -= speed;
        
        // 한 세트가 완전히 지나가면 리셋
        if (Math.abs(position) >= setWidth) {
            position = 0;
        }
        
        slider.style.transform = `translateX(${position}px)`;
        requestAnimationFrame(animate);
    }
    
    // 애니메이션 시작
    animate();
    console.log('🎬 Animation started!');
    
    // 호버 시 멈춤/재개
    const wrapper = document.querySelector('.brand-slider-wrapper');
    if (wrapper) {
        wrapper.addEventListener('mouseenter', () => {
            isRunning = false;
            console.log('⏸️ Animation paused');
        });
        
        wrapper.addEventListener('mouseleave', () => {
            isRunning = true;
            animate();
            console.log('▶️ Animation resumed');
        });
    }
});
