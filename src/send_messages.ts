import moment from "moment";
import { IUser } from "./interfaces";
import { all_users, check_users_with_time } from "./database_operations";
import { bot } from ".";
import { escape_message, final_messages, random_greeting } from "./build_messages";

export async function send_message(user: IUser, messageType: string): Promise<void> {
    try {
        if(user.allergens) {
            messageType += "_allergens"
        }

        await bot.api.sendMessage(user.chat_id, `${random_greeting()} ${escape_message(user.name)}\\!\n` + final_messages[messageType][user.canteen_id], { parse_mode: "MarkdownV2"  });
        console.log(`${user.name}/${user.chat_id}: Send Message ${messageType}.`);
    } catch (err) {
        console.error(`[Bot] Error in send_message ${user.name}/${user.chat_id}: ${err}.`);
    }
}

export async function check_sheduled_messages(): Promise<void> {
    moment.locale('de');
    let time: string = moment().format('LT');
    console.log(`${time}: Check for Shedule Message.`);

    const users = await check_users_with_time(time);
    users.forEach(user => {
        send_message(user, 'today');
    });
}

export async function broadcast_message(message: string): Promise<void> {
    console.log(`Broadcasting Message: ${message}`);
    const users = await all_users();
    for(const user of users) {
        try {
            await bot.api.sendMessage(user.chat_id, escape_message(message), { parse_mode: "MarkdownV2"  });
            console.log(`${user.name}/${user.chat_id}: Broadcasted Message.`);
        } catch (err) {
            console.error(`[Bot] Error in broadcast_message ${user.name}/${user.chat_id}: ${err}.`);
        }
    }
}