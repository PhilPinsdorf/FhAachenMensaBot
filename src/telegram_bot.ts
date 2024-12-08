import { bot } from ".";
import { all_canteens, replys } from "./definitions"; 
import sanitize from "mongo-sanitize";
import { Context, InlineKeyboard, InputFile } from "grammy";
import { user_exists, add_user, remove_user, update_canteen, update_time, update_allergens } from "./database_operations"
import { escape_message } from "./build_messages";
import { broadcast_message, send_message } from "./send_messages";

// Returns a promise, that starts the bot
export function start_bot(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const canteen_keyboard = generate_canteen_keyboard()


        bot.use(async (ctx, next) => {
            const originalReply = ctx.reply;
            const originalEditMessageText = ctx.editMessageText;
  
            ctx.reply = async (...args) => {
                if (typeof args[0] === 'string') {
                    args[0] = escape_message(args[0]); 
                }
            
                return originalReply.apply(ctx, args);
            };

            ctx.editMessageText = async (...args) => {
                if (typeof args[0] === 'string') {
                    args[0] = escape_message(args[0]); 
                }
            
                return originalEditMessageText.apply(ctx, args);
              };
        
            await next();
        });


        bot.command('start', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await add_user(chat_id, name);
            
            if(user) {
                ctx.reply(
                    replys.start(name),
                    { parse_mode: "MarkdownV2" }
                );
                return;
            } 
            
            ctx.reply(replys.already_registered());
        });


        bot.command('stop', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await remove_user(chat_id, name);

            if(user) {
                ctx.reply(
                    replys.stop(name),
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
            console.log(`${name}/${chat_id}: Read todays Meals.`);
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
            console.log(`${name}/${chat_id}: Read tomorrows Meals.`);
        });


        bot.command('canteen', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await user_exists(chat_id);

            if(!user) {
                ctx.reply(replys.only_after_start());
                console.warn(`${name}/${chat_id}: Failed to select new canteen.`);
                return;
            }

            ctx.reply(replys.select_canteen(), { parse_mode: "MarkdownV2", reply_markup: canteen_keyboard });
            console.log(`${name}/${chat_id}: Started selecting canteen process.`);
        });


        bot.command('allergens', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await update_allergens(chat_id);

            if(!user) {
                ctx.reply(replys.only_after_start());
                return;
            }

            if(user.allergens) {
                ctx.reply(replys.with_allergenes(), { parse_mode: "MarkdownV2" });
            } else {
                ctx.reply(replys.without_allergenes(), { parse_mode: "MarkdownV2" });
            }
        });


        bot.command('broadcast', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await user_exists(chat_id);

            if(!user || !user.admin) {
                console.warn(`${name}/${chat_id}: Failed to execute Broadcast. No Admin.`);
                return;
            }

            if (!ctx.match.length) {
                console.warn(`${name}/${chat_id}: Failed to execute Broadcast. No message.`);
                return
            }

            const message = ctx.match;
            await broadcast_message(message);
            console.log(`${name}/${chat_id}: Executing Broadcast.`);
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
                ctx.reply(replys.time_no_args(), { parse_mode: "MarkdownV2" });
                console.log(`User ${name}/${chat_id}: Started Time Update Process.`);
                return;
            }

            // Check if String is formated right.
            let regex: RegExp = /[0-1][0-9]:[0-5][0-9]|2[0-3]:[0-5][0-9]/

            if(!regex.test(message_arguments[0])) {
                ctx.reply(replys.time_wrong_format(), { parse_mode: "MarkdownV2" });
                console.log(`${name}/${chat_id}: Tried to update time with wrong format.`);
                return;
            }
            
            const time = message_arguments[0];
            const user = await update_time(chat_id, time);

            if(!user) {
                ctx.reply(replys.only_after_start());
                return;
            }

            ctx.reply(replys.time(time), { parse_mode: "MarkdownV2" });
        });


        bot.callbackQuery(/update-canteen-(10|[1-9])/g, async (ctx) => {
            const chat_id = ctx.chat.id; 
            const canteen_id = Number(ctx.callbackQuery.data.substring(15));
            const user = await update_canteen(chat_id, canteen_id);

            if(!user) {
                ctx.reply(replys.only_after_start());
                return;
            }

            const canteen = all_canteens.find(c => c.canteen_id === canteen_id);
            ctx.editMessageText(replys.canteen(canteen.name), { parse_mode: 'MarkdownV2' });
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
    return InlineKeyboard.from(keyboardButtons)
}

function get_user_info(ctx: Context): { chat_id: number, name: string } {
    return {
        chat_id: ctx.message.chat.id,
        name: sanitize(ctx.message.from.first_name)
    };
}