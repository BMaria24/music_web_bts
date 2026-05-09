// ==================== МЕНЮ АККАУНТА ====================
const accountBtn = document.getElementById('accountBtn');
const accountDropdown = document.getElementById('accountDropdown');

// Открыть/закрыть по клику на кнопку
accountBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    accountDropdown.classList.toggle('active');
});

// Закрыть по клику В ЛЮБОЕ МЕСТО кроме меню
document.addEventListener('click', (e) => {
    if (!accountDropdown.contains(e.target) && !accountBtn.contains(e.target)) {
        accountDropdown.classList.remove('active');
    }
});

// Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        accountDropdown.classList.remove('active');
    }
});

// Навигация
document.querySelectorAll('.account-menu-item, .account-settings-btn').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.dataset.page;
        accountDropdown.classList.remove('active');
        
        switch (page) {
            case 'favourites':
                showToast('Избранное — скоро', 'info');
                break;
            case 'playlists':
                showToast('Плейлисты — скоро', 'info');
                break;
            case 'awards':
                showToast('Награды — скоро', 'info');
                break;
            case 'tests':
                showToast('Тесты — скоро', 'info');
                break;
            case 'settings':
                showToast('Настройки — скоро', 'info');
                break;
        }
    });
});