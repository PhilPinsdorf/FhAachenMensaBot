import { Bot } from "grammy";
import { connect } from 'mongoose';
import * as schedule from 'node-schedule'; 
import { startBot } from './telegramBot';
import { parseMessages, finalMessages, escapeMessage } from './buildMessage';
import { User } from './global';
import { loadNewMeals } from './requestMeals';
import * as moment from 'moment';

export const bot = new Bot(process.env.BOT_SECRET as string);
const dbUri = process.env.DB_URI as string;

run();

async function run() {
    await connect(dbUri);
    console.log('Connected to Database');

    await loadNewMeals();
    parseMessages();
    
    await startBot();
    console.log('Telegram Bot started.')

    schedule.scheduleJob('30 2 * * 1-5', async () => { await loadNewMeals(); parseMessages(); });
    console.log('Started Chron Job for updating Message.');

    schedule.scheduleJob('*/1 * * * 1-5', () => { checkForSendMessage() });
    console.log('Started Chron Job to send Messages at picked Time.');
}

export function sendMessage(id: number, name: string, messageType: string , canteen_id: number): void {
    if (canteen_id != null) { 
        bot.api.sendMessage(id, `Guten Tag ${escapeMessage(name)}\\!\n` + finalMessages[messageType][canteen_id], { parse_mode: "MarkdownV2"  }).then( text => {
            console.log(`User ${name}/${id}: Send Message ${messageType}.`);
        }).catch( err => {
            console.log(`Error from User ${name}/${id}: ${err}.`);
        });
    } else {
        User.findOne({chat_id: id}).then( doc => {
            sendMessage(parseInt(doc.chat_id), doc.name, messageType, doc.canteen_id);
        }).catch( err => {
            console.log(`Error on sendMessage: ${err}`);
        });
    }
}

function checkForSendMessage(): void {
    moment.locale('de');
    let now: string = moment().format('LT');

    console.log(`Check for users with selected Time: ${now}.`);

    User.find({time: now}).then( docs => {
        docs.forEach(user => {
            sendMessage(parseInt(user.chat_id), user.name, 'today', user.canteen_id);
        });
    }).catch( err => {
        console.log(`Error on checkForSendMessage: ${err}`)
    });
}

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

