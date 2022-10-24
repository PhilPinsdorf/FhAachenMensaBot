import { Telegraf } from 'telegraf';
import { connect } from 'mongoose';
import { Express, Request, Response } from 'express';
import * as express from 'express';
import * as schedule from 'node-schedule'; 
import * as request from 'request';
import { startBot } from './telegramBot';
import { parseMessages, finalMessages } from './buildMessage';
import { User } from './global';
import { loadNewMeals } from './requestMeals';

export const bot = new Telegraf(process.env.BOT_SECRET as string);
const dbUri = process.env.DB_URI as string;
const app: Express = express();

app.get('/keepAlive', (req: Request, res: Response) => {
    res.send('Send keep Alive Ping.');
    res.end();
});

run();

async function run() {
    await connect(dbUri);
    console.log('Connected to Database');

    app.listen(process.env.PORT || 3000 , () => { console.log('Listen to 3000') });

    await loadNewMeals();
    parseMessages();
    
    await startBot();
    console.log('Telegram Bot started.')

    // -2 Hours because of location of Backend Server
    schedule.scheduleJob('30 2 * * 1-5', async () => { await loadNewMeals(); parseMessages(); }) 
    console.log('Started Chron Job for updating Message');

    schedule.scheduleJob('30 7 * * 1-5', () => { sendMessages() })
    console.log('Started Chron Job for sending Messages');

    schedule.scheduleJob('*/10 * * * *', () => { keepAlive() }) 
    console.log('Started Chron Job for keeping Alive Backend');

    // Send one keep Alive Ping at beginning
    keepAlive();
}

function keepAlive(): void {
    request('https://aachenmensabot.herokuapp.com/keepAlive', (err, res, body) => {
        console.log('Received Keep Alive Ping.');
    })
}

export function sendMessage(id: number, name: string, messageType: string , canteen_id?: number): void {
    if (canteen_id != null) {
        bot.telegram.sendMessage(id, `Guten Tag ${name}\\!\n` + finalMessages[messageType][canteen_id], { parse_mode: "MarkdownV2" });
        console.log(`Send Message ${messageType} to user ${id}.`);
    } else {
        User.findOne({chat_id: id}, function(err, user) {
            sendMessage(parseInt(user.chat_id), user.name, messageType, user.canteen_id);
        });
    }
}

function sendMessages(): void {
    User.find({}, function(err, users) {
        users.forEach((user) => {
            sendMessage(parseInt(user.chat_id), user.name, 'today', user.canteen_id);
        });
    });
}

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

