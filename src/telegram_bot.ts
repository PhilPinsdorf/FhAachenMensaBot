import { bot } from ".";
import { all_canteens, all_canteen_groups, replys, max_canteen_id } from "./types/definitions"; 
import sanitize from "mongo-sanitize";
import { Context, InlineKeyboard, InputFile } from "grammy";
import { user_exists, add_user, remove_user, update_canteen, update_time, update_allergens } from "./database/database_operations"
import { escape_message } from "./messages/build_messages";
import { broadcast_message, send_message } from "./messages/send_messages";
import { ICanteen, ICanteenGroup } from "./types/interfaces";

// Returns a promise, that starts the bot
export function start_bot(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const canteen_keyboard = generate_canteen_keyboard()


        bot.command('start', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await add_user(chat_id, name);
            
            if(user) {
                ctx.reply(
                    escape_message(replys.start(name)),
                    { parse_mode: "MarkdownV2" }
                );
                return;
            } 
            
            ctx.reply(replys.already_registered());
        });


        bot.command('stop', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await remove_user(chat_id, name, false);

            if(user) {
                ctx.reply(
                    escape_message(replys.stop(name)),
                    { parse_mode: "MarkdownV2" }
                );
                return; 
            }

            ctx.reply(replys.already_deleted());
        });


        bot.command('today', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await user_exists(chat_id);

            if(!user) {
                ctx.reply(replys.only_after_start());
                console.warn(`${name}/${chat_id}: Failed to read todays Meals.`);
                return;
            }

            await send_message(user, 'today');
        });


        bot.command('tomorrow', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await user_exists(chat_id);

            if(!user) {
                ctx.reply(replys.only_after_start());
                console.warn(`${name}/${chat_id}: Failed to read tomorrows Meals.`);
                return;
            }

            await send_message(user, 'tomorrow');
        });


        bot.command('canteen', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await user_exists(chat_id);

            if(!user) {
                ctx.reply(replys.only_after_start());
                console.warn(`${name}/${chat_id}: Failed to select new canteen.`);
                return;
            }

            ctx.reply(escape_message(replys.select_canteen()), { parse_mode: "MarkdownV2", reply_markup: canteen_keyboard });
            console.log(`${name}/${chat_id}: Started selecting canteen process.`);
        });


        bot.command('allergens', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await update_allergens(chat_id, name);

            if(!user) {
                ctx.reply(replys.only_after_start());
                return;
            }

            if(user.allergens) {
                ctx.reply(escape_message(replys.with_allergenes()), { parse_mode: "MarkdownV2" });
            } else {
                ctx.reply(escape_message(replys.without_allergenes()), { parse_mode: "MarkdownV2" });
            }
        });


        bot.command('broadcast', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await user_exists(chat_id);

            if(!user) {
                console.warn(`${name}/${chat_id}: Failed to execute Broadcast. Not registered.`);
                return;
            }

            if (!user.admin) {
                console.warn(`${name}/${chat_id}: Failed to execute Broadcast. No Admin.`);
                return;
            }

            if (!ctx.match.length) {
                console.warn(`${name}/${chat_id}: Failed to execute Broadcast. No Message.`);
                return
            }

            const message = ctx.match;
            console.log(`${name}/${chat_id}: Executed Broadcast.`);
            await broadcast_message(message);
        });


        bot.command('share', (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            ctx.replyWithPhoto(new InputFile('./img/qrcode.png'));
            console.log(`${name}/${chat_id}: Requested Sharing QR-Code.`);
        });


        bot.command('code', (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            ctx.reply(replys.code());
            console.log(`${name}/${chat_id}: Requested GitHub Repo.`);
        });


        bot.command('issue', (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            ctx.reply(replys.issue());
            console.log(`${name}/${chat_id}: Requested Issue Page.`);
        });


        bot.command('time', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const message_arguments: string[] = ctx.match.split(' ');

            if(message_arguments.length != 1) {
                ctx.reply(escape_message(replys.time_no_args()), { parse_mode: "MarkdownV2" });
                console.log(`User ${name}/${chat_id}: Started Time Update Process.`);
                return;
            }

            // Check if String is formated right.
            let regex: RegExp = /[0-1][0-9]:[0-5][0-9]|2[0-3]:[0-5][0-9]/

            if(!regex.test(message_arguments[0])) {
                ctx.reply(escape_message(replys.time_wrong_format()), { parse_mode: "MarkdownV2" });
                console.log(`${name}/${chat_id}: Tried to update time with wrong format.`);
                return;
            }
            
            const time = message_arguments[0];
            const user = await update_time(chat_id, name, time);

            if(!user) {
                ctx.reply(replys.only_after_start());
                return;
            }

            ctx.reply(escape_message(replys.time(time)), { parse_mode: "MarkdownV2" });
        });


        bot.callbackQuery(/update-canteen-(10|[1-9])/g, async (ctx) => {
            // Can't use get_user_info(), because ctx object in callbackQuery is different
            const chat_id: number = ctx.chat.id
            const name: string= ctx.chat.first_name ?? "Undefined";
            const canteen_id = Number(ctx.callbackQuery.data.substring(15));
            const user = await update_canteen(chat_id, name, canteen_id);

            if(!user) {
                ctx.reply(replys.only_after_start());
                return;
            }

            let canteen: ICanteen | ICanteenGroup;
            if (canteen_id <= max_canteen_id) {
                canteen = all_canteens.find(c => c.canteen_id === canteen_id);
            } else {
                canteen = all_canteen_groups.find(c => c.canteen_group_id === canteen_id);
            }
            ctx.editMessageText(escape_message(replys.canteen(canteen.name)), { parse_mode: 'MarkdownV2' });
        });


        bot.start();
        resolve();
    });
}

export async function suggest_commands(): Promise<void> {
    await bot.api.setMyCommands([
        { command: "start", description: "Subscribe to daily canteen updates." },
        { command: "today", description: "Immediately sends you todays meals." },
        { command: "tomorrow", description: "Immediately sends you tomorrows meals." },
        { command: "canteen", description: "Select your canteen." },
        { command: "time", description: "Select Time user gets the Message." },
        { command: "allergens", description: "Add Allergie annotations to your meals." },
        { command: "share", description: "Get a QR-Code for sharing the Bot." },
        { command: "code", description: "Get Link to GitHub repo." },
        { command: "issue", description: "Create new issue in the GitHub repo." },
        { command: "stop", description: "Unsubscribe from daily canteen updates." },
    ]);
}

function generate_canteen_keyboard(): InlineKeyboard {
    const keyboardButtons = []
    for(let canteen of all_canteens) 
        keyboardButtons.push([InlineKeyboard.text(canteen.name, `update-canteen-${canteen.canteen_id}`)]);
    for(let canteen_group of all_canteen_groups) 
        keyboardButtons.push([InlineKeyboard.text(canteen_group.name, `update-canteen-${canteen_group.canteen_group_id}`)]);
    return InlineKeyboard.from(keyboardButtons)
}

function get_user_info(ctx: Context): { chat_id: number, name: string } {
    return {
        chat_id: ctx.message.chat.id,
        name: sanitize(ctx.message.from.first_name)
    };
}