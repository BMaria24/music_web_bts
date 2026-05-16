// ==================== API КОНФИГУРАЦИЯ ====================
const API_URL = 'http://127.0.0.1:8000/api';

// Получить все треки
async function fetchSongs() {
    const response = await fetch(`${API_URL}/songs/`);
    return await response.json();
}

// Получить треки альбома
async function fetchSongsByAlbum(album) {
    const response = await fetch(`${API_URL}/songs/?album=${album}`);
    return await response.json();
}

// Лайкнуть трек
async function likeSong(songId, token) {
    const response = await fetch(`${API_URL}/likes/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token
        },
        body: JSON.stringify({ song: songId })
    });
    return await response.json();
}

// Убрать лайк
async function unlikeSong(likeId, token) {
    await fetch(`${API_URL}/likes/${likeId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Token ' + token }
    });
}

// Получить плейлисты
async function fetchPlaylists(token) {
    const response = await fetch(`${API_URL}/playlists/`, {
        headers: { 'Authorization': 'Token ' + token }
    });
    return await response.json();
}

// Регистрация
async function registerUser(username, password) {
    const response = await fetch(`${API_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return await response.json();
}

// Вход
async function loginUser(username, password) {
    const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('username', username);
    }
    return data;
}

//Выход
function logoutUser() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('bts_liked');
}

// Проверить, авторизован ли
function isLoggedIn() {
    return !!localStorage.getItem('access_token');
}

// Получить токен
function getToken() {
    return localStorage.getItem('access_token');
}

// Получить лайки пользователя
async function fetchLikes() {
    const token = getToken();
    if (!token) return [];
    const response = await fetch(`${API_URL}/likes/`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    return await response.json();
}

// Лайкнуть трек
async function likeSongAPI(songId) {
    const token = getToken();
    const response = await fetch(`${API_URL}/likes/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ song: songId })
    });
    if (!response.ok) {
        const err = await response.json();
        console.error('Ошибка лайка:', err);
        return null;
    }
    return await response.json();
}

// Убрать лайк
async function unlikeSongAPI(likeId) {
    const token = getToken();
    const response = await fetch(`${API_URL}/likes/${likeId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    return response.ok;
}

async function refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return false;
    const response = await fetch(`${API_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
    });
    const data = await response.json();
    if (data.access) {
        localStorage.setItem('access_token', data.access);
        return true;
    }
    return false;
}

// Получить плейлисты пользователя
async function fetchPlaylistsAPI() {
    const token = getToken();
    const response = await fetch(`${API_URL}/playlists/`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    return await response.json();
}

// Создать плейлист
async function createPlaylistAPI(name) {
    const token = getToken();
    const response = await fetch(`${API_URL}/playlists/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ name })
    });
    return await response.json();
}

// Удалить плейлист
async function deletePlaylistAPI(playlistId) {
    const token = getToken();
    await fetch(`${API_URL}/playlists/${playlistId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });
}

// Добавить трек в плейлист
async function addToPlaylistAPI(playlistId, songId) {
    const token = getToken();
    const response = await fetch(`${API_URL}/playlists/${playlistId}/add_song/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ song_id: songId })
    });
    return await response.json();
}