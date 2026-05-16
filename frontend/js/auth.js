// ==================== АВТОРИЗАЦИЯ ====================
const authSection = document.getElementById('auth_section');
let isLoginMode = false;

function openAuth() {
    hideAllSections();
    authSection.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeAuth() {
    authSection.style.display = 'none';
    document.getElementById('home_main').style.display = 'block';
    document.getElementById('albums_main').style.display = 'block';
    document.getElementById('songs_section').style.display = 'none';
    document.getElementById('favourites_section').style.display = 'none';
    document.getElementById('playlists_section').style.display = 'none';
    document.getElementById('playlist_detail_section').style.display = 'none';
}

// Переключение Регистрация ↔ Вход
document.getElementById('authSwitchBtn').addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        document.getElementById('authTitle').textContent = 'Вход';
        document.getElementById('authSubmitBtn').textContent = 'Войти';
        document.getElementById('authSwitchText').textContent = 'Нет аккаунта?';
        document.getElementById('authSwitchBtn').textContent = 'Зарегистрироваться';
    } else {
        document.getElementById('authTitle').textContent = 'Регистрация';
        document.getElementById('authSubmitBtn').textContent = 'Зарегистрироваться';
        document.getElementById('authSwitchText').textContent = 'Уже есть аккаунт?';
        document.getElementById('authSwitchBtn').textContent = 'Войти';
    }
});

// Отправка формы
document.getElementById('authSubmitBtn').addEventListener('click', async () => {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    
    if (!username || !password) {
        showToast('Заполните все поля', 'error');
        return;
    }
    
    if (isLoginMode) {
        const result = await loginUser(username, password);
        if (result.access) {
            showToast('Вход выполнен!', 'success');
            updateAccountUI();
            loadUserLikes();  // ← загружаем лайки с сервера
            closeAuth();
        } else {
            showToast('Неверный логин или пароль', 'error');
        }
    } else {
        const result = await registerUser(username, password);
        if (result.error) {
            showToast(result.error, 'error');
        } else {
            showToast('Регистрация успешна! Войдите.', 'success');
            isLoginMode = false;
            document.getElementById('authSwitchBtn').click();
        }
    }
});

function updateAccountUI() {
    const username = localStorage.getItem('username');
    if (username) {
        document.querySelector('.account-username').textContent = '@' + username;
    }
}

// Проверка авторизации для действий
function requireAuth() {
    if (!isLoggedIn()) {
        showToast('Войдите или зарегистрируйтесь', 'error');
        return false;
    }
    return true;
}

// Загрузка лайков с сервера после входа
async function loadUserLikes() {
    const likes = await fetchLikes();
    const likedMap = {};
    likes.forEach(like => {
        likedMap[Number(like.song)] = like.id;
    });
    playerState.likedTracks = likedMap;
    localStorage.setItem('bts_liked', JSON.stringify(likedMap));
    updatePlayerUI();
    updateAccountUI();
}