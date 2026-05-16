// ==================== СТРАНИЦА ПЛЕЙЛИСТОВ ====================
const playlistsSection = document.getElementById('playlists_section');
const playlistDetailSection = document.getElementById('playlist_detail_section');
let currentPlaylistName = null;
let currentPlaylistId = null;

async function openPlaylists() {
    if (!requireAuth()) return;
    
    const container = document.getElementById('playlistsGrid');
    const playlists = playerState.playlists;
    const names = Object.keys(playlists);
    
    container.innerHTML = '';
    
    // Карточка "Избранное"
    const favCard = document.createElement('div');
    favCard.className = 'playlist-card favourites';
    favCard.innerHTML = `<span class="playlist-card-name">Избранное</span>`;
    favCard.addEventListener('click', () => openFavourites());
    container.appendChild(favCard);
    
    // Остальные плейлисты
    names.filter(n => n !== 'Избранное').forEach(name => {
        const card = document.createElement('div');
        card.className = 'playlist-card custom';
        card.innerHTML = `
            <span class="playlist-card-name">${name}</span>
            <button class="playlist-card-delete" data-delete="${name}">✕</button>
        `;
        card.addEventListener('click', (e) => {
            if (e.target.closest('.playlist-card-delete')) return;
            openPlaylistDetailLocal(name);
        });
        container.appendChild(card);
    });
    
    // Карточка "Создать"
    const createCard = document.createElement('div');
    createCard.className = 'playlist-card create-new';
    createCard.innerHTML = `<span>+</span>`;
    createCard.addEventListener('click', () => {
        document.getElementById('createPlaylistModal').classList.add('active');
        document.getElementById('createPlaylistInput').value = '';
        document.getElementById('createPlaylistInput').focus();
    });
    container.appendChild(createCard);
    
    // Крестики удаления
    container.querySelectorAll('.playlist-card-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const name = btn.dataset.delete;
            delete playerState.playlists[name];
            localStorage.setItem('bts_playlists', JSON.stringify(playerState.playlists));
            openPlaylists();
            showToast('Плейлист удалён', 'info');
        });
    });
    
    hideAllSections();
    document.getElementById('playlists_section').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Создание плейлиста
document.getElementById('confirmCreatePlaylistBtn').onclick = () => {
    const input = document.getElementById('createPlaylistInput');
    const name = input.value.trim();
    
    if (!name) {
        showToast('Введите название плейлиста');
        return;
    }
    
    if (playerState.playlists[name]) {
        showToast('Плейлист с таким названием уже существует');
        return;
    }
    
    playerState.playlists[name] = [];
    localStorage.setItem('bts_playlists', JSON.stringify(playerState.playlists));
    document.getElementById('createPlaylistModal').classList.remove('active');
    openPlaylists();
    showToast('Плейлист создан', 'success');
};

// Закрытие модалки по фону
document.getElementById('createPlaylistModal').addEventListener('click', (e) => {
    if (e.target.id === 'createPlaylistModal') {
        document.getElementById('createPlaylistModal').classList.remove('active');
    }
});

// Создание по Enter
document.getElementById('createPlaylistInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('confirmCreatePlaylistBtn').click();
    }
});

// Открыть детали плейлиста (локально)
function openPlaylistDetailLocal(name) {
    currentPlaylistName = name;
    const playlists = JSON.parse(localStorage.getItem('bts_playlists') || '{}');
    const tracks = playlists[name] || [];
    
    document.getElementById('playlistDetailTitle').textContent = name;
    const emptyMsg = document.getElementById('playlistDetailEmpty');
    
    if (tracks.length === 0) {
        document.getElementById('playlistDetailTracks').innerHTML = '';
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';
        renderPlaylistTracksWithActive(tracks, -1);
    }
    
    hideAllSections();
    document.getElementById('playlist_detail_section').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Рендер треков с активным треком
function renderPlaylistTracksWithActive(tracks, activeIndex) {
    const container = document.getElementById('playlistDetailTracks');
    container.innerHTML = '';
    
    tracks.forEach((track, index) => {
        const div = document.createElement('div');
        div.className = 'track-item';
        div.dataset.index = index;
        
        const key = track.url || index;
        const isLiked = playerState.likedTracks[key];
        const isActive = (index === activeIndex && playerState.isPlaying);
        
        if (isActive) div.classList.add('active-track');
        
        div.innerHTML = `
            <span class="track-number">${index + 1}</span>
            <button class="track-play-mini" data-action="play-pl" data-index="${index}">
                <img src="./images/player/${isActive ? 'pause.png' : 'play.png'}" alt="Play">
            </button>
            <span class="track-title">${track.title}</span>
            <span class="track-duration">${track.duration || '--:--'}</span>
            <button class="track-like-btn ${isLiked ? 'liked' : ''}" data-action="like-pl" data-index="${index}">
                <img src="./images/player/${isLiked ? 'like_filled_mini.png' : 'like_empty_mini.png'}" alt="Like">
            </button>
            <button class="track-remove-btn" data-action="remove-pl" data-index="${index}">✕</button>
        `;
        
        div.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            playPlaylistTrack(index);
        });
        
        container.appendChild(div);
    });
    
    bindPlaylistTrackEvents(container);
}

// Обработчики событий для треков плейлиста
function bindPlaylistTrackEvents(container) {
    container.querySelectorAll('[data-action="play-pl"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            playPlaylistTrack(parseInt(btn.dataset.index));
        });
    });
    
    container.querySelectorAll('[data-action="like-pl"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            const playlists = JSON.parse(localStorage.getItem('bts_playlists') || '{}');
            const tracks = playlists[currentPlaylistName] || [];
            const track = tracks[index];
            const key = track.url || index;
            
            if (playerState.likedTracks[key]) {
                delete playerState.likedTracks[key];
                removeFromFavorites(track);
            } else {
                playerState.likedTracks[key] = true;
                addToFavorites(track);
            }
            
            localStorage.setItem('bts_liked', JSON.stringify(playerState.likedTracks));
            updatePlayerUI();
            
            const img = btn.querySelector('img');
            img.src = `./images/player/${playerState.likedTracks[key] ? 'like_filled_mini.png' : 'like_empty_mini.png'}`;
            btn.classList.toggle('liked', playerState.likedTracks[key]);
        });
    });
    
    container.querySelectorAll('[data-action="remove-pl"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeTrackFromPlaylist(parseInt(btn.dataset.index));
        });
    });
}

// Воспроизведение трека из плейлиста
function playPlaylistTrack(index) {
    const playlists = JSON.parse(localStorage.getItem('bts_playlists') || '{}');
    const tracks = playlists[currentPlaylistName] || [];
    
    playerState.playingQueue = [...tracks];
    playerState.playingAlbumId = currentPlaylistName;
    playerState.currentAlbumId = currentPlaylistName;
    playerState.tracks = tracks;
    playerState.currentTrackIndex = index;
    playerState.playingQueue = [];
    playerState.playingQueue = [...tracks];
    
    const track = tracks[index];
    if (!track || !track.url) return;
    
    audio.src = track.url;
    audio.play()
        .then(() => {
            playerState.isPlaying = true;
            playerBar.style.display = 'block';
            updatePlayerUI();
            renderPlaylistTracksWithActive(tracks, index);
        })
        .catch(() => showToast('Не удалось воспроизвести'));
}

// Удалить трек из плейлиста
function removeTrackFromPlaylist(index) {
    const playlists = JSON.parse(localStorage.getItem('bts_playlists') || '{}');
    playlists[currentPlaylistName].splice(index, 1);
    localStorage.setItem('bts_playlists', JSON.stringify(playlists));
    playerState.playlists = playlists;
    openPlaylistDetailLocal(currentPlaylistName);
    showToast('Трек удалён из плейлиста', 'info');
}

// Скрыть все секции
function hideAllSections() {
    document.getElementById('home_main').style.display = 'none';
    document.getElementById('albums_main').style.display = 'none';
    document.getElementById('songs_section').style.display = 'none';
    document.getElementById('favourites_section').style.display = 'none';
    document.getElementById('auth_section').style.display = 'none';
    document.getElementById('tests_section').style.display = 'none';
    document.getElementById('test_quiz_section').style.display = 'none';
    document.getElementById('test_result_section').style.display = 'none';
    document.getElementById('settings_section').style.display = 'none';

    playlistsSection.style.display = 'none';
    playlistDetailSection.style.display = 'none';
}

// Вернуться на главную
function closeAll() {
    document.getElementById('home_main').style.display = 'block';
    document.getElementById('albums_main').style.display = 'block';
    document.getElementById('songs_section').style.display = 'none';
    document.getElementById('favourites_section').style.display = 'none';
    document.getElementById('playlists_section').style.display = 'none';
    document.getElementById('playlist_detail_section').style.display = 'none';
    document.getElementById('tests_section').style.display = 'none';
    document.getElementById('test_quiz_section').style.display = 'none';
    document.getElementById('test_result_section').style.display = 'none';
    document.getElementById('settings_section').style.display = 'none';
}