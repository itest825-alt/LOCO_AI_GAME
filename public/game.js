const GAME_CONFIG = {
    timeLimit: 60,
    backgroundImage: 'images/background.png',
    monkeyImage: 'images/RM.png',
    // 20 random positions for the special monkey (percentage based)
    monkeyPositions: [
        { x: 10, y: 15 },
        { x: 25, y: 20 },
        { x: 45, y: 18 },
        { x: 65, y: 22 },
        { x: 85, y: 17 },
        { x: 15, y: 40 },
        { x: 35, y: 45 },
        { x: 55, y: 43 },
        { x: 75, y: 48 },
        { x: 90, y: 42 },
        { x: 12, y: 65 },
        { x: 30, y: 70 },
        { x: 50, y: 68 },
        { x: 70, y: 72 },
        { x: 88, y: 67 },
        { x: 20, y: 85 },
        { x: 40, y: 88 },
        { x: 60, y: 86 },
        { x: 80, y: 90 },
        { x: 95, y: 83 }
    ],
    monkeySize: 25 // monkey size in pixels
};

let currentGame = null;
let timeLeft = GAME_CONFIG.timeLimit;
let attempts = 0;
let timerInterval = null;
let userId = null;
let username = null;

const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const winScreen = document.getElementById('winScreen');
const loseScreen = document.getElementById('loseScreen');
const startBtn = document.getElementById('startBtn');
const gameContainer = document.getElementById('gameContainer');
const timerDisplay = document.getElementById('timer');
const attemptsDisplay = document.getElementById('attempts');
const alreadyPlayedMsg = document.getElementById('alreadyPlayed');
const playerNameDisplay = document.getElementById('playerName');

function initTelegramWebApp() {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#667eea');
        tg.setBackgroundColor('#667eea');
        
        const user = tg.initDataUnsafe?.user;
        if (user) {
            userId = user.id.toString();
            username = user.first_name || user.username || 'Player';
            playerNameDisplay.textContent = username;
        } else {
            userId = 'demo_' + Date.now();
            username = 'Demo Player';
            playerNameDisplay.textContent = username + ' (Demo)';
        }
    } else {
        userId = 'demo_' + Date.now();
        username = 'Demo Player';
        playerNameDisplay.textContent = username + ' (Demo)';
    }
    
    checkPlayerStatus();
}

async function checkPlayerStatus() {
    try {
        const response = await fetch(`/api/check-player/${userId}`);
        const data = await response.json();
        
        if (data.hasPlayed) {
            startBtn.style.display = 'none';
            alreadyPlayedMsg.style.display = 'block';
        } else {
            await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, username })
            });
        }
    } catch (error) {
        console.error('Error checking player:', error);
    }
}

startBtn.addEventListener('click', startGame);

function startGame() {
    // Pick random position for the special monkey
    const randomPosition = GAME_CONFIG.monkeyPositions[
        Math.floor(Math.random() * GAME_CONFIG.monkeyPositions.length)
    ];
    
    currentGame = {
        monkeyPosition: randomPosition
    };
    
    console.log('🎯 Special monkey position:', randomPosition);
    
    timeLeft = GAME_CONFIG.timeLimit;
    attempts = 0;
    attemptsDisplay.textContent = '0';
    timerDisplay.textContent = '60';
    timerDisplay.style.color = '#667eea';
    timerDisplay.classList.remove('pulse');
    
    setupGame();
    showScreen(gameScreen);
    startTimer();
}

function setupGame() {
    gameContainer.innerHTML = '';
    
    // Background (similar monkeys)
    const background = document.createElement('img');
    background.src = GAME_CONFIG.backgroundImage;
    background.className = 'game-background';
    background.alt = 'Game background';
    
    // Special monkey (overlayed on top)
    const specialMonkey = document.createElement('img');
    specialMonkey.src = GAME_CONFIG.monkeyImage;
    specialMonkey.className = 'special-monkey';
    specialMonkey.alt = 'Special monkey';
    specialMonkey.style.left = currentGame.monkeyPosition.x + '%';
    specialMonkey.style.top = currentGame.monkeyPosition.y + '%';
    specialMonkey.style.width = GAME_CONFIG.monkeySize + 'px';
    specialMonkey.style.height = GAME_CONFIG.monkeySize + 'px';
    
    // Click on special monkey = WIN
    specialMonkey.addEventListener('click', (e) => {
        e.stopPropagation();
        winGame();
    });
    
    // Click anywhere else = MISS
    background.addEventListener('click', (e) => {
        attempts++;
        attemptsDisplay.textContent = attempts;
        showMissEffect(e);
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    });
    
    // Also allow clicking on container (in case of transparent areas)
    gameContainer.addEventListener('click', (e) => {
        if (e.target === gameContainer) {
            attempts++;
            attemptsDisplay.textContent = attempts;
            showMissEffect(e);
        }
    });
    
    gameContainer.appendChild(background);
    gameContainer.appendChild(specialMonkey);
}

function showMissEffect(event) {
    const rect = gameContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const effect = document.createElement('div');
    effect.className = 'miss-effect';
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    
    gameContainer.appendChild(effect);
    
    setTimeout(() => effect.remove(), 600);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerDisplay.style.color = '#ef4444';
            timerDisplay.classList.add('pulse');
        }
        
        if (timeLeft <= 0) {
            loseGame();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

async function winGame() {
    stopTimer();
    
    const timeTaken = GAME_CONFIG.timeLimit - timeLeft;
    
    try {
        const response = await fetch('/api/win', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, username, attempts, timeTaken })
        });
        
        const data = await response.json();
        
        document.getElementById('winPrize').textContent = data.prize;
        document.getElementById('winTime').textContent = timeTaken;
        document.getElementById('winAttempts').textContent = attempts;
        
        showScreen(winScreen);
        confetti();
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert(data.message);
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
    } catch (error) {
        console.error('Error recording win:', error);
        alert('خطأ في حفظ الفوز!');
    }
}

async function loseGame() {
    stopTimer();
    
    const timeTaken = GAME_CONFIG.timeLimit;
    
    try {
        await fetch('/api/loss', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, username, attempts, timeTaken })
        });
        
        document.getElementById('loseAttempts').textContent = attempts;
        showScreen(loseScreen);
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        }
    } catch (error) {
        console.error('Error recording loss:', error);
    }
}

function showScreen(screen) {
    [startScreen, gameScreen, winScreen, loseScreen].forEach(s => {
        s.classList.remove('active');
    });
    screen.classList.add('active');
}

function confetti() {
    const duration = 3000;
    const end = Date.now() + duration;
    
    (function frame() {
        const timeLeft = end - Date.now();
        if (timeLeft <= 0) return;
        
        const particleCount = 3;
        for(let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            particle.style.backgroundColor = ['#667eea', '#764ba2', '#fbbf24', '#ef4444', '#10b981'][Math.floor(Math.random() * 5)];
            document.querySelector('.result-container.win').appendChild(particle);
            
            setTimeout(() => particle.remove(), 2000);
        }
        
        requestAnimationFrame(frame);
    }());
}

window.addEventListener('load', initTelegramWebApp);
