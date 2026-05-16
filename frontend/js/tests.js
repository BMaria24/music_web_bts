const testsData = [
    {
        title: 'BTS: разминка',
        questions: [
            { q: 'В каком году дебютировали BTS?', options: ['2012', '2013', '2014', '2015'], correct: 1 },
            { q: 'Сколько участников в BTS?', options: ['5', '6', '7', '8'], correct: 2 },
            { q: 'Кто лидер BTS?', options: ['Jin', 'RM', 'Suga', 'V'], correct: 1 },
            { q: 'Как называется дебютная песня BTS?', options: ['Dynamite', 'No More Dream', 'Boy With Luv', 'ON'], correct: 1 },
            { q: 'Какой цвет официального фандома?', options: ['Синий', 'Зелёный', 'Фиолетовый', 'Розовый'], correct: 2 },
        ]
    },
    {
        title: 'BTS: Дни рождения',
        questions: [
            { q: 'Когда день рождение у Намджуна?', options: ['12.09.1994', '09.09.1996', '15.09.1994', '18.08.1993'], correct: 0 },
            { q: 'Когда день рождение у Джина?', options: ['02.02.1992', '12.12.1993', '04.12.1992', '04.12.1993'], correct: 3 },
            { q: 'Когда день рождение у Юнги?', options: ['12.03.1993', '18.03.1994', '10.03.1994', '09.03.1993'], correct: 3 },
            { q: 'Когда день рождение у Хосока?', options: ['12.02.1994', '18.02.1994', '09.02.1994', '12.03.1993'], correct: 1 },
            { q: 'Когда день рождение у Чимина?', options: ['12.10.1995', '09.10.1996', '13.10.1995', '18.10.1995'], correct: 2 },
            { q: 'Когда день рождение у Тэхена?', options: ['30.12.1995', '31.12.1994', '15.12.1995', '30.12.1997'], correct: 0 },
            { q: 'Когда день рождение у Чонгука?', options: ['01.09.1998', '05.09.1997', '01.09.1997', '01.08.1997'], correct: 2 },
        ]
    }
];

let currentTest = null;
let currentQuestion = 0;
let score = 0;
let selectedOption = null;
let answered = false;

function openTests() {
    if (!requireAuth()) return;
    const username = localStorage.getItem('username') || 'guest';
    const results = JSON.parse(localStorage.getItem('test_results_' + username) || '{}');
    
    const container = document.getElementById('testsGrid');
    container.innerHTML = testsData.map((test, i) => {
        const r = results[test.id || i];
        const icon = r && r.passed ? '💜' : '❤';
        return `<div class="test-card" data-test="${i}">${icon} ${test.title}</div>`;
    }).join('');
    
    container.querySelectorAll('.test-card').forEach(card => {
        card.addEventListener('click', () => startTest(parseInt(card.dataset.test)));
    });
    
    hideAllSections();
    document.getElementById('tests_section').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startTest(index) {
    currentTest = index;
    currentQuestion = 0;
    score = 0;
    answered = false;
    
    hideAllSections();
    document.getElementById('test_quiz_section').style.display = 'block';
    document.getElementById('testQuizTitle').textContent = testsData[index].title;
    showQuestion();
}

function showQuestion() {
    const test = testsData[currentTest];
    const q = test.questions[currentQuestion];
    
    document.getElementById('testQuestion').textContent = `Вопрос ${currentQuestion + 1} из ${test.questions.length}: ${q.q}`;
    
    const optionsContainer = document.getElementById('testOptions');
    optionsContainer.innerHTML = q.options.map((opt, i) => `
        <div class="test-option" data-option="${i}">${opt}</div>
    `).join('');
    
    optionsContainer.querySelectorAll('.test-option').forEach(opt => {
        opt.addEventListener('click', () => {
            if (answered) return;
            answered = true;
            selectedOption = parseInt(opt.dataset.option);
            opt.classList.add('selected');
            
            // Проверить
            const correct = q.correct;
            optionsContainer.children[correct].classList.add('correct');
            if (selectedOption !== correct) {
                opt.classList.add('wrong');
            } else {
                score++;
            }
        });
    });
    
    document.getElementById('testNextBtn').textContent = 
        currentQuestion < test.questions.length - 1 ? 'Далее' : 'Завершить';
    document.getElementById('testNextBtn').style.display = 'block';
}

document.getElementById('testNextBtn').addEventListener('click', () => {
    const test = testsData[currentTest];
    
    if (currentQuestion < test.questions.length - 1) {
        currentQuestion++;
        answered = false;
        showQuestion();
    } else {
        showResult();
    }
});

document.getElementById('testBackBtn').addEventListener('click', openTests);

function showResult() {
    const test = testsData[currentTest];
    const percent = Math.round(score / test.questions.length * 100);
    const username = localStorage.getItem('username') || 'guest';
    let reward = '';
    
    // Сохранить результат для этого пользователя
    const results = JSON.parse(localStorage.getItem('test_results_' + username) || '{}');
    results[test.id || currentTest] = { passed: percent === 100, percent, score, total: test.questions.length };
    localStorage.setItem('test_results_' + username, JSON.stringify(results));
    
    if (percent === 100) {
        const avatarMap = {
            0: ['avatar_beginner_1', 'avatar_beginner_2'],
            1: ['avatar_birthday_1']
        };
        const earnedAvatars = JSON.parse(localStorage.getItem('earned_avatars_' + username) || '[]');
        const avatars = avatarMap[currentTest] || [];
        let newAvatars = 0;
        avatars.forEach(av => {
            if (!earnedAvatars.includes(av)) {
                earnedAvatars.push(av);
                newAvatars++;
            }
        });
        localStorage.setItem('earned_avatars_' + username, JSON.stringify(earnedAvatars));
        reward = newAvatars > 0 ? `Вы получаете ${newAvatars} новые аватарки!` : 'Аватарки уже получены!';
    } else if (percent >= 60) {
        reward = 'Хороший результат! Но для аватарки нужно 100%';
    } else {
        reward = 'Попробуйте ещё раз!';
    }
    
    document.getElementById('testResult').innerHTML = `
        <div>${score} из ${test.questions.length} (${percent}%)</div>
        <div style="margin-top: 20px;">${reward}</div>
    `;
    
    hideAllSections();
    document.getElementById('test_result_section').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}