let isProcessingLike = false;

// ==================== СОСТОЯНИЕ ПЛЕЕРА ====================
const playerState = {
    currentAlbumId: null,
    currentTrackIndex: 0,
    isPlaying: false,
    tracks: [],
    playingQueue: [],            // ← треки, которые СЕЙЧАС в очереди (альбом или плейлист)
    playingAlbumId: null,
    likedTracks: JSON.parse(localStorage.getItem('bts_liked') || '{}'),
    repeatMode: 'none',
    playlists: JSON.parse(localStorage.getItem('bts_playlists') || '{}'),
    currentTrackForPlaylist: null
};

const audio = document.getElementById('audioPlayer');
const playerBar = document.getElementById('playerBar');
const songsSection = document.getElementById('songs_section');

// ==================== КЛИК НА АЛЬБОМ → ПОКАЗАТЬ ТРЕКИ ====================
document.addEventListener('click', (e) => {
    const albumBtn = e.target.closest('.album-btn');
    if (!albumBtn) return;
    showTracks(albumBtn.dataset.album);
});

function showTracks(albumId) {
    const tracks = songsData[albumId];
    if (!tracks || tracks.length === 0) {
        showToast('Для этого альбома треки ещё не добавлены.', 'info');
        return;
    }
    
    playerState.currentAlbumId = albumId;
    playerState.tracks = tracks;

    const albumInfo = getAlbumInfo(albumId);
    document.getElementById('songsAlbumTitle').textContent = albumInfo.title;
    renderTracklist(tracks);
    songsSection.style.display = 'block';
    songsSection.scrollIntoView({ behavior: 'smooth' });
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

        const key = track.url || index;
        const isLiked = playerState.likedTracks[key];
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
            // ← ДОБАВЬ ЭТИ ДВЕ СТРОКИ:
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
            // ← ДОБАВЬ ЭТИ ДВЕ СТРОКИ:
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
    // Если это новый клик по треку — фиксируем очередь
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
    if (isProcessingLike) return;  // ← игнорируем повторные клики
    isProcessingLike = true;
    
    const track = playerState.tracks[index];
    if (!track) {
        isProcessingLike = false;
        return;
    }
    const key = track.url || index;
    
    if (playerState.likedTracks[key]) {
        delete playerState.likedTracks[key];
        removeFromFavorites(track);
    } else {
        playerState.likedTracks[key] = true;
        addToFavorites(track);
    }
    
    localStorage.setItem('bts_liked', JSON.stringify(playerState.likedTracks));
    renderTracklist(playerState.tracks);
    updatePlayerUI();
    
    setTimeout(() => { isProcessingLike = false; }, 100); // ← разблокировка через 100мс
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
        
        const key = track.url || playerState.currentTrackIndex;
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
});

audio.addEventListener('loadedmetadata', () => {
    document.getElementById('durationTime').textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
    if (playerState.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    } else if (playerState.currentTrackIndex < playerState.tracks.length - 1) {
        playTrack(playerState.currentTrackIndex + 1);
    }
});

// ==================== ПРОГРЕСС-БАР: ПЕРЕТАСКИВАНИЕ ====================
const progressBar = document.getElementById('progressBar');
let isDragging = false;

// Нажали на полосу — начинаем перетаскивать
progressBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateProgress(e);             // Сразу перемотать в точку клика
});

// Водим мышью с зажатой кнопкой — плавно перематываем
document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updateProgress(e);
    }
});

// Отпустили кнопку мыши — заканчиваем
document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Функция обновления времени
function updateProgress(e) {
    const rect = progressBar.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    
    // Ограничиваем от 0 до 1
    percent = Math.max(0, Math.min(1, percent));
    
    audio.currentTime = percent * audio.duration;
}

// ==================== ПЛЕЙЛИСТЫ ====================
function openPlaylistModal(trackIndex) {
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

    if (names.length === 0) {
        container.innerHTML = '<div style="color:#888;text-align:center;padding:20px;">Плейлистов пока нет</div>';
        return;
    }

    container.innerHTML = names.map(name => `
        <div class="playlist-item" data-playlist="${name}">
            <span class="playlist-item-name">${name}</span>
            <span class="playlist-item-count">${playerState.playlists[name].length}</span>
            ${name !== 'Избранное' ? `<button class="playlist-delete-btn" data-delete="${name}">✕</button>` : ''}
        </div>
    `).join('');

    container.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.playlist-delete-btn')) return;
            addTrackToPlaylist(item.dataset.playlist);
        });
    });

    // Обработчик на крестики
    container.querySelectorAll('.playlist-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePlaylist(btn.dataset.delete);
        });
    });
}

function deletePlaylist(name) {
    if (name === 'Избранное') return; // избранное нельзя удалить
    delete playerState.playlists[name];
    localStorage.setItem('bts_playlists', JSON.stringify(playerState.playlists));
    renderPlaylistList();
    showToast('Плейлист «' + name + '» удалён', 'info');
}

function addTrackToPlaylist(playlistName) {
    const track = playerState.tracks[playerState.currentTrackForPlaylist];
    if (!track) return;

    if (playerState.playlists[playlistName].some(t => t.url === track.url)) {
        showToast('Этот трек уже есть в плейлисте!');
        return;
    }

    playerState.playlists[playlistName].push({
        title: track.title,
        url: track.url,
        duration: track.duration
    });

    if (playlistName === 'Избранное') {
        const key = track.url || playerState.currentTrackForPlaylist;
        playerState.likedTracks[key] = true;
        localStorage.setItem('bts_liked', JSON.stringify(playerState.likedTracks));
    }

    localStorage.setItem('bts_playlists', JSON.stringify(playerState.playlists));
    
    renderTracklist(playerState.tracks);
    updatePlayerUI();
    
    closePlaylistModal();
    /*alert(`Добавлено в «${playlistName}»`);*/
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

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
updatePlayerUI();
console.log('🎵 BTS Music готов!');

// ==================== КАСТОМНЫЕ УВЕДОМЛЕНИЯ ====================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    // Убираем старые классы
    toast.className = 'toast';
    
    // Добавляем тип и показываем
    toast.classList.add(type, 'show');
    toastMessage.textContent = message;
    
    // Автоматически скрываем через 2.5 секунды
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.add('hide');
    }, 2500);
}