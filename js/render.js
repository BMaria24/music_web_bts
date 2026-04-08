const carousel = document.getElementById('carousel');
let offset = 0;
let slideWidth = 0; // Будет вычисляться динамически

function calculateSlideWidth() {
    const container = document.querySelector('.carousel-slide');
    if (container) {
        const containerWidth = container.clientWidth;
        const slidesCount = document.querySelectorAll('.slide-block').length;
        if (slidesCount > 0) {
            // Ширина слайда с учетом gap (30px)
            slideWidth = (containerWidth - 60) / 3; // 3 альбома, gap 30px между ними
        }
    }
    return slideWidth;
}

function renderAlbums(member) {
    if (!carousel) {
        console.error('Элемент carousel не найден');
        return;
    }
    
    carousel.innerHTML = '';
    offset = 0;
    
    const albums = albumsData[member];
    
    if (!albums || albums.length === 0) {
        carousel.innerHTML = '<div style="text-align: center; width: 100%; padding: 50px;">Альбомов пока нет</div>';
        return;
    }
    
    albums.forEach((album, index) => {
        const div = document.createElement('div');
        div.className = 'slide-block';
        
        div.innerHTML = `
            <button class="album-btn" data-album="${album.id}">
                <img src="./images/albums/${album.img}" alt="${album.title}" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                <div class="album-title-overlay">${album.title}</div>
                <h3>${album.title}</h3>
            </button>
        `;
        carousel.appendChild(div);
    });
    
    // После добавления элементов пересчитываем ширину
    setTimeout(() => {
        calculateSlideWidth();
        updateCarouselButtons();
        carousel.style.transform = 'translateX(0px)';
    }, 100);
}