function updateCarouselButtons() {
    const slides = document.querySelectorAll('.slide-block');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    
    if (!slides.length || !prevBtn || !nextBtn) return;
    
    const container = document.querySelector('.carousel-container');
    const carouselSlide = document.querySelector('.carousel-slide');
    
    if (!container || !carouselSlide) return;
    
    const containerWidth = carouselSlide.clientWidth;
    const totalWidth = slides.length * (containerWidth / 3);
    const maxOffset = Math.min(0, containerWidth - totalWidth);
    
    // Визуальное отключение кнопок
    if (offset >= 0) {
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
    } else {
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
    }
    
    if (offset <= maxOffset) {
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
    } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }
}

document.querySelector('.next')?.addEventListener('click', () => {
    const slides = document.querySelectorAll('.slide-block');
    if (!slides.length) return;
    
    const carouselSlide = document.querySelector('.carousel-slide');
    if (!carouselSlide) return;
    
    const containerWidth = carouselSlide.clientWidth;
    const slideTotalWidth = containerWidth / 3 + 27; 
    const totalWidth = slides.length * slideTotalWidth;
    const maxOffset = Math.min(0, containerWidth - totalWidth);
    
    if (offset > maxOffset) {
        offset -= slideTotalWidth;
        if (offset < maxOffset) offset = maxOffset;
        carousel.style.transform = `translateX(${offset}px)`;
        updateCarouselButtons();
    }
});

document.querySelector('.prev')?.addEventListener('click', () => {
    if (offset < 0) {
        const carouselSlide = document.querySelector('.carousel-slide');
        if (!carouselSlide) return;
        
        const containerWidth = carouselSlide.clientWidth;
        const slideTotalWidth = containerWidth / 3 + 40;
        
        offset += slideTotalWidth;
        if (offset > 0) offset = 0;
        carousel.style.transform = `translateX(${offset}px)`;
        updateCarouselButtons();
    }
});

// Обновляем при ресайзе окна
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const currentOffset = offset;
        offset = 0;
        carousel.style.transform = 'translateX(0px)';
        
        setTimeout(() => {
            calculateSlideWidth();
            offset = currentOffset;
            carousel.style.transform = `translateX(${offset}px)`;
            updateCarouselButtons();
        }, 100);
    }, 250);
});