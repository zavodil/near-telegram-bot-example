process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const {NearCall, NearView} = require('./near');

// Set COUNTER contract_id from https://examples.near.org/rust-counter
const contract = process.env.CONTRACT_ID || "dev-1631189149748-7868807";

// replace the value below with the Telegram token you receive from @BotFather
const token =  process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/increment/, (msg) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  NearCall(contract, "increment", {})
    .then((resp) => {
      // send a message to the chat acknowledging receipt of their message
      bot.sendMessage( msg.chat.id, resp);
    });
});

bot.onText(/\/decrement/, (msg) => {
  NearCall(contract, "decrement", {})
    .then((resp) => bot.sendMessage(msg.chat.id, resp));
});

bot.onText(/\/reset/, (msg) => {
  NearCall(contract, "reset", {})
    .then((resp) => bot.sendMessage(msg.chat.id, resp));
});

bot.onText(/\/get_num/, (msg) => {
  NearView(contract, "get_num", {})
    .then((resp) => bot.sendMessage(msg.chat.id, JSON.stringify(resp)));
});
