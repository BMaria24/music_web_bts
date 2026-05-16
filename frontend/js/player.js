let isProcessingLike = false;

// ==================== СОСТОЯНИЕ ПЛЕЕРА ====================
const playerState = {
    currentAlbumId: null,
    currentTrackIndex: 0,
    isPlaying: false,
    tracks: [],
    playingQueue: [],            
    playingAlbumId: null,
    likedTracks: JSON.parse(localStorage.getItem('bts_liked') || '{}'),
    repeatMode: 'none',
    playlists: JSON.parse(localStorage.getItem('bts_playlists') || '{}'),
    currentTrackForPlaylist: null,
    tracksListened: parseInt(localStorage.getItem('tracks_listened') || '0'),
    trackStartTime: 0,
    trackCounted: false,
    wasSeeked: false,
    countedSongs: JSON.parse(localStorage.getItem('counted_songs') || '[]'),
};

// При загрузке проверить авторизацию
if (isLoggedIn()) {
    updateAccountUI();
    loadUserLikes();
}

const savedAvatar = localStorage.getItem('avatar_' + (localStorage.getItem('username') || 'guest'));
if (savedAvatar && savedAvatar !== 'default') {
    const accAvatar = document.querySelector('.account-avatar');
    const headerLogo = document.querySelector('.header_logo');
    if (accAvatar) accAvatar.src = `./images/avatars/${savedAvatar}.png`;
}

const audio = document.getElementById('audioPlayer');
const playerBar = document.getElementById('playerBar');
const songsSection = document.getElementById('songs_section');

// ==================== КЛИК НА АЛЬБОМ → ПОКАЗАТЬ ТРЕКИ ====================
document.addEventListener('click', (e) => {
    const albumBtn = e.target.closest('.album-btn');
    if (!albumBtn) return;
    showTracks(albumBtn.dataset.album);
});

async function showTracks(albumId) {
    document.getElementById('auth_section').style.display = 'none';
    const albumInfo = getAlbumInfo(albumId);
    const allSongs = await fetchSongs();
    
    const artist = albumId.split('_')[0].toUpperCase();
    
    const tracks = allSongs.filter(song => {
        const songArtist = song.artist.toUpperCase().trim();
        const searchArtist = albumId.split('_')[0].toUpperCase().trim();
        const songAlbum = song.album.replace(/\s+/g, ' ').trim().toLowerCase();
        const searchAlbum = albumInfo.title.replace(/\s+/g, ' ').trim().toLowerCase();
        return songArtist === searchArtist && songAlbum === searchAlbum;
    });
    
    if (!tracks || tracks.length === 0) {
        showToast('Для этого альбома треки ещё не добавлены.', 'info');
        return;
    }
    
    const formattedTracks = tracks.map(song => ({
        title: song.title,
        url: song.audio_file,
        duration: song.duration,
        id: song.id
    }));
    
    playerState.currentAlbumId = albumId;
    playerState.tracks = formattedTracks;

    document.getElementById('songsAlbumTitle').textContent = albumInfo.title;
    renderTracklist(formattedTracks);
    songsSection.style.display = 'block';
    songsSection.scrollIntoView({ behavior: 'smooth' });
}

function getAlbumNameFromId(albumId) {
    const albumInfo = getAlbumInfo(albumId);
    return albumInfo.title;
}

function getAlbumInfo(albumId) {
    for (const member in albumsData) {
        const found = albumsData[member].find(a => a.id === albumId);
        if (found) return { ...found, artist: member === 'bts' ? 'BTS' : member.toUpperCase() };
    }
    return { title: 'Альбом', img: '', artist: '' };
}

// ==================== РЕНДЕР ТРЕКОВ ====================
function renderTracklist(tracks) {
    const container = document.getElementById('songsTracklist');
    container.innerHTML = '';

    tracks.forEach((track, index) => {
        const div = document.createElement('div');
        div.className = 'track-item';
        div.dataset.index = index;

        const key = track.id;
        const isLiked = isLoggedIn() ? !!playerState.likedTracks[key] : false;
        const isActive = (playerState.playingAlbumId === playerState.currentAlbumId &&
            playerState.currentTrackIndex === index && playerState.isPlaying);

        if (isActive) div.classList.add('active-track');

        div.innerHTML = `
            <span class="track-number">${index + 1}</span>
            <button class="track-play-mini" data-action="play" data-index="${index}">
                <img src="./images/player/${isActive ? 'pause.png' : 'play.png'}" 
                     alt="${isActive ? 'Pause' : 'Play'}">
            </button>
            <span class="track-title">${track.title}</span>
            <button class="track-like-btn ${isLiked ? 'liked' : ''}" data-action="like" data-index="${index}">
                <img src="./images/player/${isLiked ? 'like_filled_mini.png' : 'like_empty_mini.png'}" alt="Like">
            </button>
            <span class="track-duration">${track.duration || '--:--'}</span>
            <button class="track-more-btn" data-action="more" data-index="${index}">
                <img src="./images/player/more.png" alt="Ещё">
            </button>
        `;

        div.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            playerState.playingQueue = [...playerState.tracks];
            playerState.playingAlbumId = playerState.currentAlbumId;
            playTrack(index);
        });
        container.appendChild(div);
    });

    container.querySelectorAll('[data-action="play"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            playerState.playingQueue = [...playerState.tracks];
            playerState.playingAlbumId = playerState.currentAlbumId;
            if (isCurrentTrack(index) && playerState.isPlaying) {
                pauseTrack();
            } else {
                playTrack(index);
            }
        });
    });

    container.querySelectorAll('[data-action="like"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(parseInt(btn.dataset.index));
        });
    });

    container.querySelectorAll('[data-action="more"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openPlaylistModal(parseInt(btn.dataset.index));
        });
    });
}

// ==================== ВОСПРОИЗВЕДЕНИЕ ====================
function playTrack(index) {
    if (playerState.playingQueue.length === 0) {
        playerState.playingQueue = [...playerState.tracks];
        playerState.playingAlbumId = playerState.currentAlbumId;
    }
    
    const queue = playerState.playingQueue;
    const track = queue[index];
    
    if (!track || !track.url) {
        showToast(`Нет файла для: ${track?.title || 'трека'}`);
        return;
    }

    playerState.currentTrackIndex = index;
    playerState.trackStartTime = 0;
    playerState.trackCounted = false;
    playerState.wasSeeked = false;
    audio.src = track.url;

    audio.play()
        .then(() => {
            playerState.isPlaying = true;
            playerBar.style.display = 'block';
            updatePlayerUI();
            if (playerState.currentAlbumId === playerState.playingAlbumId) {
                renderTracklist(playerState.tracks);
            }
        })
        .catch(err => {
            console.error('Ошибка воспроизведения:', err);
            playerState.isPlaying = false;
            updatePlayerUI();
            audio.play().catch(() => {
                showToast('Не удалось воспроизвести: ' + track.title);
            });
        });
}

function pauseTrack() {
    audio.pause();
    playerState.isPlaying = false;
    updatePlayerUI();
    if (playerState.currentAlbumId === playerState.playingAlbumId) {
        renderTracklist(playerState.tracks);
    }
}

function togglePlayPause() {
    if (playerState.isPlaying) {
        pauseTrack();
    } else if (audio.src) {
        audio.play()
            .then(() => {
                playerState.isPlaying = true;
                updatePlayerUI();
                renderTracklist(playerState.tracks);
            })
            .catch(() => playTrack(playerState.currentTrackIndex));
    }
}

function isCurrentTrack(index) {
    return playerState.currentTrackIndex === index;
}

// ==================== НАВИГАЦИЯ ====================
document.getElementById('prevTrack').addEventListener('click', () => {
    if (!playerState.playingQueue.length) return;
    
    if (playerState.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
    }
    
    const i = playerState.currentTrackIndex > 0 
        ? playerState.currentTrackIndex - 1 
        : playerState.playingQueue.length - 1;
    
    playTrack(i);
    
    if (typeof currentPlaylistName !== 'undefined' && currentPlaylistName &&
        document.getElementById('playlist_detail_section')?.style.display === 'block') {
        const tracks = JSON.parse(localStorage.getItem('bts_playlists') || '{}')[currentPlaylistName] || [];
        setTimeout(() => renderPlaylistTracksWithActive(tracks, i), 100);
    }
    if (document.getElementById('favourites_section')?.style.display === 'block') {
        setTimeout(() => openFavourites(), 100);
    }
});

document.getElementById('nextTrack').addEventListener('click', () => {
    if (!playerState.playingQueue.length) return;
    
    if (playerState.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
    }
    
    const i = playerState.currentTrackIndex < playerState.playingQueue.length - 1 
        ? playerState.currentTrackIndex + 1 
        : 0;
    
    playTrack(i);
    
    if (typeof currentPlaylistName !== 'undefined' && currentPlaylistName &&
        document.getElementById('playlist_detail_section')?.style.display === 'block') {
        const tracks = JSON.parse(localStorage.getItem('bts_playlists') || '{}')[currentPlaylistName] || [];
        setTimeout(() => renderPlaylistTracksWithActive(tracks, i), 100);
    }
    if (document.getElementById('favourites_section')?.style.display === 'block') {
        setTimeout(() => openFavourites(), 100);
    }
});

document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);

// ==================== REPEAT ====================
document.getElementById('repeatBtn').addEventListener('click', toggleRepeat);

function toggleRepeat() {
    playerState.repeatMode = playerState.repeatMode === 'one' ? 'none' : 'one';
    updateRepeatIcon();
}

function updateRepeatIcon() {
    const btn = document.getElementById('repeatBtn');
    const icon = document.getElementById('repeatIcon');
    if (!btn || !icon) return;
    
    if (playerState.repeatMode === 'one') {
        icon.src = './images/player/repeat_one.png';
        btn.classList.add('active-repeat');
        btn.title = 'Зациклен трек';
    } else {
        icon.src = './images/player/repeat_all.png';
        btn.classList.remove('active-repeat');
        btn.title = 'Играть подряд';
    }
}

// ==================== ЛАЙК ====================
function toggleLike(index) {
    if (!requireAuth()) return;
    if (isProcessingLike) return;
    isProcessingLike = true;
    
    const queue = playerState.playingQueue.length > 0 ? playerState.playingQueue : playerState.tracks;
    const track = queue[index];
    if (!track) { isProcessingLike = false; return; }
    
    const key = track.id;
    
    if (playerState.likedTracks[key]) {
        delete playerState.likedTracks[key];
        removeFromFavorites(track);
    } else {
        playerState.likedTracks[key] = true;
        addToFavorites(track);
    }
    
    localStorage.setItem('bts_liked', JSON.stringify(playerState.likedTracks));
    updatePlayerUI();
    updateLikeIcons(index);
    
    if (document.getElementById('favourites_section').style.display === 'block') {
        openFavourites();
    }
    
    setTimeout(() => { isProcessingLike = false; }, 300);
}
    
function updateLikeIcons(trackIndex) {
    const container = document.getElementById('songsTracklist');
    if (!container || !playerState.tracks.length) return;
    
    const items = container.querySelectorAll('.track-item');
    const track = playerState.tracks[trackIndex];
    if (!track) return;
    
    const key = track.id || track.url || trackIndex;
    const isLiked = !!playerState.likedTracks[key];
    
    const item = items[trackIndex];
    if (!item) return;
    
    const btn = item.querySelector('.track-like-btn');
    if (!btn) return;
    
    const img = btn.querySelector('img');
    if (img) {
        img.src = `./images/player/${isLiked ? 'like_filled_mini.png' : 'like_empty_mini.png'}`;
    }
    if (isLiked) {
        btn.classList.add('liked');
    } else {
        btn.classList.remove('liked');
    }
}

function addToFavorites(track) {
    if (!playerState.playlists['Избранное']) {
        playerState.playlists['Избранное'] = [];
    }
    if (!playerState.playlists['Избранное'].some(t => t.url === track.url)) {
        playerState.playlists['Избранное'].push({
            title: track.title,
            url: track.url,
            duration: track.duration
        });
        localStorage.setItem('bts_playlists', JSON.stringify(playerState.playlists));
    }
}

function removeFromFavorites(track) {
    if (!playerState.playlists['Избранное']) return;
    playerState.playlists['Избранное'] = playerState.playlists['Избранное'].filter(t => t.url !== track.url);
    localStorage.setItem('bts_playlists', JSON.stringify(playerState.playlists));
}

document.getElementById('playerLikeBtn').addEventListener('click', () => {
    if (!requireAuth()) return;
    toggleLike(playerState.currentTrackIndex);
});

// ==================== UI ПЛЕЕРА ====================
function updatePlayerUI() {
    const queue = playerState.playingQueue.length > 0 ? playerState.playingQueue : playerState.tracks;
    const track = queue[playerState.currentTrackIndex];

    if (playerState.isPlaying) {
        document.getElementById('playPauseIcon').src = './images/player/pause.png';
    } else {
        document.getElementById('playPauseIcon').src = './images/player/play.png';
    }

    if (track) {
        playerBar.style.display = 'block';
        document.getElementById('playerTrackTitle').textContent = track.title;
        
        const key = track.id; 
        document.getElementById('playerLikeIcon').src = 
            `./images/player/${playerState.likedTracks[key] ? 'like_filled_player.png' : 'like_empty_player.png'}`;
        
        updateRepeatIcon();
    } else if (!audio.src) {
        playerBar.style.display = 'none';
    }
}

// ==================== ПРОГРЕСС ====================
audio.addEventListener('timeupdate', () => {
    document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
    if (audio.duration) {
        document.getElementById('progressFill').style.width = 
            (audio.currentTime / audio.duration * 100) + '%';
    }
    
    // Засчитать трек только если дослушан без перемоток
    if (!playerState.trackCounted && !playerState.wasSeeked && 
        audio.currentTime >= audio.duration - 0.5 && audio.duration > 0) {
        const songId = playerState.tracks[playerState.currentTrackIndex]?.id;
        if (songId && !playerState.countedSongs.includes(songId)) {
            playerState.countedSongs.push(songId);
            localStorage.setItem('counted_songs', JSON.stringify(playerState.countedSongs));
            playerState.trackCounted = true;
            playerState.tracksListened++;
            localStorage.setItem('tracks_listened', playerState.tracksListened);
            updateLevelBadge();
        }
    }
});

audio.addEventListener('loadedmetadata', () => {
    document.getElementById('durationTime').textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
    if (playerState.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
    }
    
    const queue = playerState.playingQueue.length > 0 ? playerState.playingQueue : playerState.tracks;
    const i = playerState.currentTrackIndex + 1;
    if (i >= queue.length) return;
    
    if (typeof currentPlaylistName !== 'undefined' && currentPlaylistName &&
        document.getElementById('playlist_detail_section')?.style.display === 'block') {
        playPlaylistTrack(i);
        return;
    }
    if (document.getElementById('favourites_section')?.style.display === 'block') {
        playFavourite(i);
        return;
    }
    
    playTrack(i);
});

// ==================== ПРОГРЕСС-БАР: ПЕРЕТАСКИВАНИЕ ====================
const progressBar = document.getElementById('progressBar');
let isDragging = false;

progressBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateProgress(e);
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updateProgress(e);
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

function updateProgress(e) {
    const rect = progressBar.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    playerState.wasSeeked = true;
    playerState.trackCounted = false;
    audio.currentTime = percent * audio.duration;
}

// ==================== УРОВНИ ====================
function updateLevelBadge() {
    const level = Math.floor(playerState.tracksListened / 5) + 1;
    const badge = document.querySelector('.account-level-badge');
    if (badge) {
        badge.textContent = level;
        const remaining = 5 - (playerState.tracksListened % 5);
        badge.title = `Уровень ${level} (осталось ${remaining} треков до следующего)`;
    }
}

// ==================== ПЛЕЙЛИСТЫ ====================
function openPlaylistModal(trackIndex) {
    if (!requireAuth()) return;
    playerState.currentTrackForPlaylist = trackIndex;
    if (!playerState.playlists['Избранное']) {
        playerState.playlists['Избранное'] = [];
        localStorage.setItem('bts_playlists', JSON.stringify(playerState.playlists));
    }
    renderPlaylistList();
    document.getElementById('playlistModal').classList.add('active');
}

function closePlaylistModal() {
    document.getElementById('playlistModal').classList.remove('active');
    playerState.currentTrackForPlaylist = null;
}

document.getElementById('playlistModal').addEventListener('click', (e) => {
    if (e.target.id === 'playlistModal') closePlaylistModal();
});

function renderPlaylistList() {
    const container = document.getElementById('playlistList');
    const names = Object.keys(playerState.playlists);

    let html = '';
    
    html += `
        <div class="playlist-item" data-playlist="Избранное">
            <span class="playlist-item-name">Избранное</span>
            <span class="playlist-item-count">${(playerState.playlists['Избранное'] || []).length}</span>
        </div>
    `;
    
    names.filter(n => n !== 'Избранное').forEach(name => {
        html += `
            <div class="playlist-item" data-playlist="${name}">
                <span class="playlist-item-name">${name}</span>
                <span class="playlist-item-count">${playerState.playlists[name].length}</span>
                <button class="playlist-delete-btn" data-delete="${name}">✕</button>
            </div>
        `;
    });
    
    container.innerHTML = html || '<div style="color:#888;text-align:center;padding:20px;">Плейлистов пока нет</div>';

    container.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.playlist-delete-btn')) return;
            addTrackToPlaylist(item.dataset.playlist);
        });
    });

    container.querySelectorAll('.playlist-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePlaylist(btn.dataset.delete);
        });
    });
}

function deletePlaylist(name) {
    if (name === 'Избранное') return; 
    delete playerState.playlists[name];
    localStorage.setItem('bts_playlists', JSON.stringify(playerState.playlists));
    renderPlaylistList();
    showToast('Плейлист «' + name + '» удалён', 'info');
}

function addTrackToPlaylist(playlistName) {
    const track = playerState.tracks[playerState.currentTrackForPlaylist];
    if (!track) return;

    if (!playerState.playlists[playlistName]) {
        playerState.playlists[playlistName] = [];
    }
    
    if (playerState.playlists[playlistName].some(t => t.url === track.url)) {
        showToast('Этот трек уже в плейлисте!');
        return;
    }

    playerState.playlists[playlistName].push({
        title: track.title,
        url: track.url,
        duration: track.duration,
        id: track.id
    });

    if (playlistName === 'Избранное') {
        const key = track.id;  
        playerState.likedTracks[key] = true;
        localStorage.setItem('bts_liked', JSON.stringify(playerState.likedTracks));
        updatePlayerUI();
        updateLikeIcons(playerState.currentTrackForPlaylist);
    }

    localStorage.setItem('bts_playlists', JSON.stringify(playerState.playlists));
    
    closePlaylistModal();
    showToast('Добавлено в «' + playlistName + '»');
}

document.getElementById('createPlaylistBtn').addEventListener('click', () => {
    const input = document.getElementById('newPlaylistName');
    const name = input.value.trim();
    
    if (!name) return showToast('Введите название плейлиста');
    if (playerState.playlists[name]) return showToast('Плейлист с таким названием уже существует');
    
    playerState.playlists[name] = [];
    localStorage.setItem('bts_playlists', JSON.stringify(playerState.playlists));
    input.value = '';
    renderPlaylistList();
});

// ==================== УТИЛИТЫ ====================
function formatTime(s) {
    if (isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ==================== КАСТОМНЫЕ УВЕДОМЛЕНИЯ ====================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = 'toast';
    
    toast.classList.add(type, 'show');
    toastMessage.textContent = message;
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.add('hide');
    }, 2500);
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
updatePlayerUI();
updateLevelBadge();
console.log('🎵 BTS Music готов!');

fetchSongs().then(songs => {
    console.log('Треки с сервера:', songs);
});