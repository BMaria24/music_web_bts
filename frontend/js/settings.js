function openSettings() {
    if (!requireAuth()) return;
    
    const username = localStorage.getItem('username') || 'user';
    document.getElementById('settingsUsername').value = '@' + username;
    
    updateSettingsLevel();
    renderSettingsAvatars();
    
    hideAllSections();
    document.getElementById('settings_section').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateSettingsLevel() {
    const listened = playerState.tracksListened || 0;
    const level = Math.floor(listened / 5) + 1;
    const progress = listened % 5;
    
    document.getElementById('settingsLevelBadge').textContent = level;
    document.getElementById('settingsProgressFill').style.width = (progress / 5 * 100) + '%';
    document.getElementById('settingsProgressText').textContent = `${progress}/5 треков до уровня ${level + 1}`;
}

function renderSettingsAvatars() {
    const username = localStorage.getItem('username') || 'guest';
    const earned = JSON.parse(localStorage.getItem('earned_avatars_' + username) || '[]');
    const currentAvatar = localStorage.getItem('avatar_' + username) || 'default';
    const container = document.getElementById('settingsAvatarsGrid');
    
    const allAvatars = [
        { id: 'default', name: 'По умолчанию' },
        { id: 'avatar_beginner_1', name: 'Новичок 1' },
        { id: 'avatar_beginner_2', name: 'Новичок 2' },
        { id: 'avatar_birthday_1', name: 'Дни рождения' },
    ];
    
    container.innerHTML = allAvatars.map(av => {
        const unlocked = earned.includes(av.id) || av.id === 'default';
        const active = currentAvatar === av.id;
        const imgSrc = `./images/avatars/${av.id}.png`;
        return `
            <img src="${imgSrc}" 
                 class="settings-avatar-item ${unlocked ? 'unlocked' : 'locked'} ${active ? 'active' : ''}" 
                 data-avatar="${av.id}" 
                 title="${av.name}${unlocked ? '' : ' (заблокировано)'}"
                 onerror="this.src='./images/header/logo_acc.png'">
        `;
    }).join('');
    
    container.querySelectorAll('.settings-avatar-item.unlocked').forEach(img => {
        img.addEventListener('click', () => {
            const avatarId = img.dataset.avatar;
            localStorage.setItem('avatar_' + username, avatarId);
            document.getElementById('settingsAvatar').src = img.src;
            document.querySelector('.account-avatar').src = img.src;
            container.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
            img.classList.add('active');
            showToast('Аватарка обновлена!', 'success');
        });
    });
}

document.getElementById('saveNameBtn').addEventListener('click', () => {
    const newName = document.getElementById('settingsUsername').value.trim().replace('@', '');
    if (newName) {
        localStorage.setItem('username', newName);
        document.querySelector('.account-username').textContent = '@' + newName;
        showToast('Имя обновлено!', 'success');
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    logoutUser();
    location.reload();
});