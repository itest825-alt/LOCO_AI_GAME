const CONFIG = {
    time: 60,
    bg: 'images/background.png',
    monkey: 'images/RM.png',
    size: 60,
    positions: [
        {x:15,y:20},{x:30,y:18},{x:50,y:22},{x:70,y:19},{x:85,y:25},
        {x:20,y:45},{x:40,y:48},{x:60,y:43},{x:80,y:50},{x:90,y:46},
        {x:18,y:70},{x:35,y:72},{x:55,y:68},{x:75,y:74},{x:88,y:69},
        {x:25,y:88},{x:45,y:85},{x:65,y:90},{x:82,y:87},{x:95,y:83}
    ]
};

let game = null;
let time = CONFIG.time;
let clicks = 0;
let timer = null;
let userId = null;
let username = null;

const screens = {
    start: document.getElementById('start'),
    game: document.getElementById('game'),
    win: document.getElementById('win'),
    lose: document.getElementById('lose')
};

const els = {
    playerName: document.getElementById('playerName'),
    startBtn: document.getElementById('startBtn'),
    locked: document.getElementById('locked'),
    arena: document.getElementById('arena'),
    timer: document.getElementById('timer'),
    clicks: document.getElementById('clicks'),
    winPrize: document.getElementById('winPrize'),
    winTime: document.getElementById('winTime'),
    winClicks: document.getElementById('winClicks'),
    loseClicks: document.getElementById('loseClicks')
};

function init() {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#667eea');
        tg.setBackgroundColor('#667eea');
        
        const user = tg.initDataUnsafe?.user;
        userId = user?.id?.toString() || 'demo_' + Date.now();
        username = user?.first_name || user?.username || 'Demo';
    } else {
        userId = 'demo_' + Date.now();
        username = 'Demo';
    }
    
    els.playerName.textContent = username;
    checkPlayer();
}

async function checkPlayer() {
    try {
        const res = await fetch(`/api/check-player/${userId}`);
        const data = await res.json();
        
        if (data.hasPlayed) {
            els.startBtn.style.display = 'none';
            els.locked.style.display = 'block';
        } else {
            await fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId, username})
            });
        }
    } catch (e) {
        console.error(e);
    }
}

els.startBtn.onclick = () => {
    game = {pos: CONFIG.positions[Math.floor(Math.random() * CONFIG.positions.length)]};
    time = CONFIG.time;
    clicks = 0;
    els.clicks.textContent = '0';
    els.timer.textContent = '60';
    
    setupArena();
    show('game');
    startTimer();
};

function setupArena() {
    els.arena.innerHTML = '';
    
    const bg = document.createElement('img');
    bg.src = CONFIG.bg;
    bg.className = 'game-background';
    bg.draggable = false;
    
    const monkey = document.createElement('img');
    monkey.src = CONFIG.monkey;
    monkey.className = 'special-monkey';
    monkey.style.left = game.pos.x + '%';
    monkey.style.top = game.pos.y + '%';
    monkey.style.width = monkey.style.height = CONFIG.size + 'px';
    monkey.draggable = false;
    
    monkey.addEventListener('click', (e) => {
        e.stopPropagation();
        win();
    });
    
    monkey.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        win();
    });
    
    bg.addEventListener('click', (e) => {
        clicks++;
        els.clicks.textContent = clicks;
        miss(e);
    });
    
    bg.addEventListener('touchend', (e) => {
        e.preventDefault();
        clicks++;
        els.clicks.textContent = clicks;
        miss(e.changedTouches[0]);
    });
    
    els.arena.appendChild(bg);
    els.arena.appendChild(monkey);
}

function miss(e) {
    const rect = els.arena.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;
    
    const effect = document.createElement('div');
    effect.className = 'miss-effect';
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    
    els.arena.appendChild(effect);
    setTimeout(() => effect.remove(), 600);
}

function startTimer() {
    timer = setInterval(() => {
        time--;
        els.timer.textContent = time;
        
        if (time <= 0) {
            lose();
        }
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

async function win() {
    stopTimer();
    const taken = CONFIG.time - time;
    
    try {
        const res = await fetch('/api/win', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userId, username, attempts: clicks, timeTaken: taken})
        });
        
        const data = await res.json();
        els.winPrize.textContent = data.prize;
        els.winTime.textContent = taken;
        els.winClicks.textContent = clicks;
        
        show('win');
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
    } catch (e) {
        console.error(e);
    }
}

async function lose() {
    stopTimer();
    
    try {
        await fetch('/api/loss', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userId, username, attempts: clicks, timeTaken: CONFIG.time})
        });
        
        els.loseClicks.textContent = clicks;
        show('lose');
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        }
    } catch (e) {
        console.error(e);
    }
}

function show(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    window.scrollTo(0, 0);
}

window.addEventListener('load', init);
