document.addEventListener('DOMContentLoaded', () => {
    console.log('Сайт загружен');
    
    // Проверяем наличие карусели
    const carousel = document.getElementById('carousel');
    if (!carousel) {
        console.error('Элемент carousel не найден!');
        return;
    }
    
    // Рендерим альбомы BTS по умолчанию
    if (typeof renderAlbums !== 'undefined') {
        renderAlbums('bts');
    } else {
        console.error('Функция renderAlbums не определена');
    }
    
    // Обработчики для кнопок участников
    const btns = document.querySelectorAll('.btn_home');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const member = btn.dataset.member;
            console.log('Выбран участник:', member);
            
            // Убираем активный класс со всех кнопок
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (typeof renderAlbums !== 'undefined') {
                renderAlbums(member);
            }
        });
    });
});