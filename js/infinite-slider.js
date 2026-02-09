// 무한 슬라이더 구현
console.log('🎭 Infinite Slider Loading...');

document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.partners-slider');
    const track = document.querySelector('.partners-track');
    
    if (!slider || !track) {
        console.warn('⚠️ Slider elements not found');
        return;
    }
    
    console.log('✅ Slider elements found');
    
    // 원본 로고 복제 (무한 루프용)
    const logos = track.innerHTML;
    track.innerHTML = logos + logos; // 2배로 복제
    
    console.log('✅ Logos duplicated');
    
    // 애니메이션 설정
    let position = 0;
    const speed = 1; // 픽셀/프레임 (속도 조절 가능)
    const trackWidth = track.scrollWidth / 2; // 절반 너비
    
    function animate() {
        position -= speed;
        
        // 절반 지점에 도달하면 리셋
        if (Math.abs(position) >= trackWidth) {
            position = 0;
        }
        
        track.style.transform = `translate3d(${position}px, 0, 0)`;
        requestAnimationFrame(animate);
    }
    
    // 애니메이션 시작
    animate();
    console.log('🎬 Animation started!');
    
    // 호버 시 일시정지
    slider.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
    });
    
    slider.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
    });
});
