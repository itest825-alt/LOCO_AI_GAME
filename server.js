require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/check-player/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const hasPlayed = db.hasPlayerPlayed(userId);
    res.json({ hasPlayed });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/register', (req, res) => {
  try {
    const { userId, username } = req.body;
    db.registerPlayer(userId, username);
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/win', (req, res) => {
  try {
    const { userId, username, attempts, timeTaken } = req.body;
    const prizeAmount = parseFloat(process.env.AIRDROP_AMOUNT) || 100;
    
    db.recordWin(userId, username, attempts, timeTaken, prizeAmount);
    
    res.json({ 
      success: true, 
      prize: prizeAmount,
      message: `Congratulations! You won ${prizeAmount} LOCO tokens!`
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/loss', (req, res) => {
  try {
    const { userId, username, attempts, timeTaken } = req.body;
    db.recordLoss(userId, username, attempts, timeTaken);
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/winners', (req, res) => {
  try {
    const winners = db.getWinners();
    res.json(winners);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server: http://localhost:${PORT}\n`);
});
