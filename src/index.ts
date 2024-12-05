import { Bot } from "grammy";
import { connect } from 'mongoose';
import * as schedule from 'node-schedule'; 
import { startBot, suggest_commands } from './telegram_bot';
import { parseMessages, finalMessages, escapeMessage } from './build_message';
import { loadNewMeals } from './request_meals';
import * as moment from 'moment';
import { check_users_with_time } from "./database_operations";

export const bot = new Bot(process.env.BOT_SECRET as string);
const dbUri = process.env.DB_URI as string;

run();

async function run() {
    await connect(dbUri);
    console.log('Connected to Database');

    await loadNewMeals();
    parseMessages();
    
    await suggest_commands();
    await startBot();
    console.log('Telegram Bot started.')

    schedule.scheduleJob('0 3 * * 1-5', async () => { await loadNewMeals(); parseMessages(); });
    console.log('Started Chron Job for updating Message.');

    schedule.scheduleJob('*/1 * * * 1-5', () => { checkForSendMessage() });
    console.log('Started Chron Job to send Messages at picked Time.');
}

export async function send_message(id: number, name: string, messageType: string , canteen_id: number): Promise<void> {
    try {
        await bot.api.sendMessage(id, `Guten Tag ${escapeMessage(name)}\\!\n` + finalMessages[messageType][canteen_id], { parse_mode: "MarkdownV2"  });
        console.log(`${name}/${id}: Send Message ${messageType}.`);
    } catch (err) {
        console.error(`Bot Error in send_message ${name}/${id}: ${err}.`);
    }
}

async function checkForSendMessage(): Promise<void> {
    moment.locale('de');
    let time: string = moment().format('LT');
    console.log(`Check for users with selected Time: ${time}.`);

    const users = await check_users_with_time(time);
    users.forEach(user => {
        send_message(user.chat_id, user.name, 'today', user.canteen_id);
    });
}

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

