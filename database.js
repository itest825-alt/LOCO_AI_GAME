const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'gameDB.json');

function initDatabase() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ players: {}, results: [] }, null, 2));
    }
}

function readDB() {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (error) {
        return { players: {}, results: [] };
    }
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

initDatabase();

function registerPlayer(userId, username, wallet) {
    const db = readDB();
    if (!db.players[userId]) {
        db.players[userId] = {
            username: username,
            wallet: wallet,
            has_played: false,
            won_at: null,
            prize_amount: 0
        };
        writeDB(db);
    }
}

function hasPlayerPlayed(userId) {
    const db = readDB();
    return db.players[userId]?.has_played === true;
}

function registerPlayer(userId, username) {
    const db = readDB();
    if (!db.players[userId]) {
        db.players[userId] = { username, has_played: false, won_at: null, prize_amount: 0 };
        writeDB(db);
    }
}

function recordWin(userId, username, attempts, timeTaken, prizeAmount) {
    const db = readDB();
    db.players[userId] = { username, has_played: true, won_at: new Date().toISOString(), prize_amount: prizeAmount };
    db.results.push({ user_id: userId, username, attempts, time_taken: timeTaken, won: true, played_at: new Date().toISOString() });
    writeDB(db);
}

function recordLoss(userId, username, attempts, timeTaken) {
    const db = readDB();
    if (db.players[userId]) {
        db.players[userId].has_played = true;
    } else {
        db.players[userId] = { username, has_played: true, won_at: null, prize_amount: 0 };
    }
    db.results.push({ user_id: userId, username, attempts, time_taken: timeTaken, won: false, played_at: new Date().toISOString() });
    writeDB(db);
}

function getWinners() {
    const db = readDB();
    return Object.values(db.players)
        .filter(p => p.prize_amount > 0)
        .map(p => ({ username: p.username, prize_amount: p.prize_amount, won_at: p.won_at }))
        .sort((a, b) => new Date(b.won_at) - new Date(a.won_at))
        .slice(0, 10);
}

module.exports = { hasPlayerPlayed, registerPlayer, recordWin, recordLoss, getWinners };
