import { Telegraf } from 'telegraf';
import { connect } from 'mongoose';
import { Express, Request, Response } from 'express';
import * as express from 'express';
import * as schedule from 'node-schedule'; 
import * as request from 'request';
import { startBot } from './telegramBot';
import { parseMessages, finalMessages, escapeMessage } from './buildMessage';
import { User } from './global';
import { loadNewMeals } from './requestMeals';
import moment = require('moment');

export const bot = new Telegraf(process.env.BOT_SECRET as string);
const dbUri = process.env.DB_URI as string;
const app: Express = express();

app.get('/keepAlive', (req: Request, res: Response) => {
    res.send('Send keep Alive Ping.');
    res.end();
});

//run();
checkForSendMessage();

async function run() {
    await connect(dbUri);
    console.log('Connected to Database');

    app.listen(process.env.PORT || 3000 , () => { console.log('Listen to 3000') });

    await loadNewMeals();
    parseMessages();
    
    await startBot();
    console.log('Telegram Bot started.')

    // -2 Hours because of location of Backend Server
    schedule.scheduleJob('30 2 * * 1-5', async () => { await loadNewMeals(); parseMessages(); });
    console.log('Started Chron Job for updating Message');

    schedule.scheduleJob('*/1 * * * 1-5', () => { checkForSendMessage() });
    console.log('Started Chron Job to send Messages at picked Time.');

    schedule.scheduleJob('*/10 * * * *', () => { keepAlive() }) ;
    console.log('Started Chron Job for keeping Alive Backend.');
}

function keepAlive(): void {
    request('https://aachenmensabot.herokuapp.com/keepAlive', (err, res, body) => {
        console.log('Received Keep Alive Ping.');
    })
}

export function sendMessage(id: number, name: string, messageType: string , canteen_id?: number): void {
    if (canteen_id != null) { 
        bot.telegram.sendMessage(id, `Guten Tag ${escapeMessage(name)}\\!\n` + finalMessages[messageType][canteen_id], { parse_mode: "MarkdownV2"  });
        console.log(`Send Message ${messageType} to user ${id}.`);
    } else {
        User.findOne({chat_id: id}, function(err, user) {
            sendMessage(parseInt(user.chat_id), user.name, messageType, user.canteen_id);
        });
    }
}

function checkForSendMessage(): void {
    moment.locale('de');
    // Add two hours because Server is in different time Zone
    let now: string = moment().add(2, 'hours').format('LT');

    console.log(`Check for users with selected Time: ${now}`);

    User.find({time: now}, function(err, users) {
        users.forEach((user) => {
            sendMessage(parseInt(user.chat_id), user.name, 'today', user.canteen_id);
        });
    });
}

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

