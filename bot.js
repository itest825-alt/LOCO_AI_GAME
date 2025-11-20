require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL;

if (!token || token === 'your_bot_token_here') {
    console.error('❌ BOT_TOKEN not set!');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Bot started!');

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;

    bot.sendMessage(chatId,
        `🎮 Welcome ${firstName} to LOCO Monkey Hunt!\n\n` +
        `🐵 Find the special monkey and win tokens!\n` +
        `🏆 Prize: ${process.env.AIRDROP_AMOUNT} LOCO\n` +
        `⏱️ Time: 60 seconds\n` +
        `⚠️ One attempt only!`,
        {
            reply_markup: {
                inline_keyboard: [[
                    { text: '🎮 PLAY NOW!', web_app: { url: webAppUrl } }
                ]]
            }
        }
    );
});

bot.onText(/\/winners/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await fetch(`${webAppUrl}/api/winners`);
        const winners = await response.json();
        
        if (winners.length === 0) {
            bot.sendMessage(chatId, '🏆 No winners yet!');
            return;
        }
        
        let message = '🏆 *Winners:*\n\n';
        winners.forEach((w, i) => {
            const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅';
            message += `${emoji} ${w.username} - ${w.prize_amount} LOCO\n`;
        });
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Error');
    }
});
