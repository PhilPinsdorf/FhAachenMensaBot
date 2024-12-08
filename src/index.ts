import { Bot } from "grammy";
import { connect } from 'mongoose';
import * as schedule from 'node-schedule'; 
import { start_bot, suggest_commands } from './telegram_bot';
import { parseMessages } from './build_messages';
import { request_relevant_menus } from './request_menus';
import { check_sheduled_messages } from "./send_messages";

export const bot = new Bot(process.env.BOT_SECRET as string);
const dbUri = process.env.DB_URI as string;

run();

async function run() {
    await connect(dbUri);
    console.log('Connected to Database');

    await request_relevant_menus();
    parseMessages();
    
    await suggest_commands();
    await start_bot();
    console.log('Telegram Bot started.')

    schedule.scheduleJob('0 3 * * 1-5', async () => { await request_relevant_menus(); parseMessages(); });
    console.log('Started Chron Job for updating Message.');

    schedule.scheduleJob('*/1 * * * 1-5', () => { check_sheduled_messages() });
    console.log('Started Chron Job to send Messages at picked Time.');
}

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());