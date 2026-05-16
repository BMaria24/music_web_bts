// ==================== СТРАНИЦА ИЗБРАННОГО ====================
const favouritesSection = document.getElementById('favourites_section');

function openFavourites() {
    const playlists = JSON.parse(localStorage.getItem('bts_playlists') || '{}');
    const favourites = playlists['Избранное'] || [];
    const container = document.getElementById('favouritesTracklist');
    const emptyMsg = document.getElementById('favouritesEmpty');
    
    if (favourites.length === 0) {
        container.innerHTML = '';
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';
        container.innerHTML = '';
        
        favourites.forEach((track, index) => {
            const div = document.createElement('div');
            div.className = 'track-item';
            div.dataset.index = index;
            
            // ← ДОБАВЬ: проверка активного трека
            const isActive = (playerState.playingAlbumId === 'favourites' &&
                playerState.currentTrackIndex === index && playerState.isPlaying);
            
            if (isActive) div.classList.add('active-track');  // ← ДОБАВЬ
            
            div.innerHTML = `
                <span class="track-number">${index + 1}</span>
                <button class="track-play-mini" data-action="play-fav" data-index="${index}">
                    <img src="./images/player/${isActive ? 'pause.png' : 'play.png'}" alt="Play">
                </button>
                <span class="track-title">${track.title}</span>
                <button class="track-like-btn liked" data-action="unlike-fav" data-index="${index}">
                    <img src="./images/player/like_filled_mini.png" alt="Unlike">
                </button>
                <span class="track-duration">${track.duration || '--:--'}</span>
            `;
            
            div.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                playFavourite(index);
            });
            
            container.appendChild(div);
        });

        // Кнопки Play
        container.querySelectorAll('[data-action="play-fav"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                playFavourite(parseInt(btn.dataset.index));
            });
        });

        // Убрать лайк
        container.querySelectorAll('[data-action="unlike-fav"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                removeFavourite(index);
            });
        });
    }

    // Скрыть все секции, показать избранное
    document.getElementById('home_main').style.display = 'none';
    document.getElementById('albums_main').style.display = 'none';
    document.getElementById('songs_section').style.display = 'none';
    document.getElementById('playlists_section').style.display = 'none';
    document.getElementById('playlist_detail_section').style.display = 'none';
    document.getElementById('auth_section').style.display = 'none';
    document.getElementById('settings_section').style.display = 'none';
    document.getElementById('tests_section').style.display = 'none';
    document.getElementById('test_quiz_section').style.display = 'none';
    document.getElementById('test_result_section').style.display = 'none';
    favouritesSection.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function playFavourite(index) {
    const playlists = JSON.parse(localStorage.getItem('bts_playlists') || '{}');
    const favourites = playlists['Избранное'] || [];
    
    playerState.playingQueue = [...favourites];
    playerState.playingAlbumId = 'favourites';
    playerState.currentAlbumId = 'favourites';
    playerState.tracks = favourites;
    playerState.currentTrackIndex = index;
    
    // Очистить playingQueue чтобы playTrack зафиксировал заново
    playerState.playingQueue = [];
    playerState.playingQueue = [...favourites];
    
    const track = favourites[index];
    if (!track || !track.url) return;
    
    audio.src = track.url;
    audio.play()
        .then(() => {
            playerState.isPlaying = true;
            playerBar.style.display = 'block';
            updatePlayerUI();
            openFavourites();
        })
        .catch(() => {
            showToast('Не удалось воспроизвести');
        });
}

function removeFavourite(index) {
    const playlists = JSON.parse(localStorage.getItem('bts_playlists') || '{}');
    const favourites = playlists['Избранное'] || [];
    const track = favourites[index];
    
    if (track) {
        // Удаляем лайк по url
        for (const key in playerState.likedTracks) {
            const t = playerState.tracks.find(tr => tr.id == key);
            if (t && t.url === track.url) {
                delete playerState.likedTracks[key];
                break;
            }
        }
        // Если не нашли в tracks — ищем по id трека
        if (track.id) {
            delete playerState.likedTracks[Number(track.id)];
        }
        localStorage.setItem('bts_liked', JSON.stringify(playerState.likedTracks));
    }
    
    favourites.splice(index, 1);
    playlists['Избранное'] = favourites;
    localStorage.setItem('bts_playlists', JSON.stringify(playlists));
    playerState.playlists = playlists;
    
    openFavourites();
    updatePlayerUI();
    
    // Обновить иконки в треклисте
    const container = document.getElementById('songsTracklist');
    if (container && container.children.length > 0) {
        const items = container.querySelectorAll('.track-item');
        items.forEach(item => {
            const idx = parseInt(item.dataset.index);
            const t = playerState.tracks[idx];
            if (!t) return;
            const btn = item.querySelector('.track-like-btn');
            if (!btn) return;
            const isLiked = !!playerState.likedTracks[t.id];
            const img = btn.querySelector('img');
            if (img) img.src = `./images/player/${isLiked ? 'like_filled_mini.png' : 'like_empty_mini.png'}`;
            btn.classList.toggle('liked', isLiked);
        });
    }
}

// Возврат на главную
function closeFavourites() {
    document.getElementById('home_main').style.display = 'block';
    document.getElementById('albums_main').style.display = 'block';
    document.getElementById('songs_section').style.display = 'none';
    document.getElementById('favourites_section').style.display = 'none';
    document.getElementById('playlists_section').style.display = 'none';
    document.getElementById('playlist_detail_section').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}