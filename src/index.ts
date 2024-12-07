import { Bot } from "grammy";
import { connect } from 'mongoose';
import * as schedule from 'node-schedule'; 
import { start_bot, suggest_commands } from './telegram_bot';
import { parseMessages, final_messages, escape_message, random_greeting } from './build_messages';
import { request_relevant_menus } from './request_menus';
import moment from 'moment';
import { check_users_with_time } from "./database_operations";
import { IUser } from "./interfaces";

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

export async function send_message(user: IUser, messageType: string): Promise<void> {
    try {
        if(user.allergens) {
            messageType += "_allergens"
        }

        await bot.api.sendMessage(user.chat_id, `${random_greeting()} ${escape_message(user.name)}\\!\n` + final_messages[messageType][user.canteen_id], { parse_mode: "MarkdownV2"  });
        console.log(`${user.name}/${user.chat_id}: Send Message ${messageType}.`);
    } catch (err) {
        console.error(`Bot Error in send_message ${user.name}/${user.chat_id}: ${err}.`);
    }
}

async function check_sheduled_messages(): Promise<void> {
    moment.locale('de');
    let time: string = moment().format('LT');
    console.log(`Check for users with selected Time: ${time}.`);

    const users = await check_users_with_time(time);
    users.forEach(user => {
        send_message(user, 'today');
    });
}

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

