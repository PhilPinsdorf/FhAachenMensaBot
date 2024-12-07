import { bot, send_message } from ".";
import { all_canteens } from "./definitions"; 
import * as sanitize from "mongo-sanitize";
import { Context, InlineKeyboard, InputFile } from "grammy";
import { user_exists, add_user, remove_user, update_canteen, update_time, update_allergens } from "./database_operations"

// Returns a promise, that starts the bot
export function start_bot(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const canteen_keyboard = generate_canteen_keyboard()


        bot.command('start', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await add_user(chat_id, name);
            
            if(user) {
                ctx.reply(
                    `Danke ${name}, dass du dich für den Dienst angemeldet hast\\! \n\nDu bekommst ab jetzt jeden Tag um \*9:30 Uhr\* eine Benachrichtigung darüber, was es heute in deiner Aachener Mensa zu essen gibt\\. Falls du zwischendurch nachgucken möchtest, was es heute und morgen in der Mensa gibt, kannst du das jederzeit mit /today und /tomorrow tun\\. Falls du Updates von einer anderen Mensa bekommen möchtest, kannst du deine Mensa mit /canteen ändern\\. Die Mensa Eupener Straße ist standartmäßig am Anfang ausgewählt\\. Falls du Updates zu einer anderen Zeit bekommen möchtest, kannst du deine Zeit mit /time ändern\\. Du kannst dir Infos über Allergene und Inhaltsstoffe mit /allergens zu deiner täglichen Nachicht hinzufügen\\. \n\nMit /stop kannst du dich von diesem Dienst wieder abmelden\\. \n\nBei Rückfragen oder Bugs, schreibe \\@philpinsdorf auf Telegram an\\.`,
                    { parse_mode: "MarkdownV2" }
                );
                return;
            } 
            
            ctx.reply(`Du hast dich bereits registriert.`);
        });


        bot.command('stop', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await remove_user(chat_id, name);

            if(user) {
                ctx.reply(
                    `Vielen Dank ${name}, dass du meinen Dienst verwendet hast\\. \n\nDu hast hiermit deinen Account \*gelöscht\* und wirst in Zukunft \*keine Benachichtigungen\* mehr bekommen\\. \n\nFalls du dich doch umentscheiden solltest kannst du jederzeit dich mit /start wieder anmelden\\.`,
                    { parse_mode: "MarkdownV2" }
                );
                return; 
            }

            ctx.reply(`Dein Account wurde bereits gelöscht.`);
        });


        bot.command('today', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await user_exists(chat_id);

            if(!user) {
                ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                console.warn(`${name}/${chat_id}: Failed to read todays Meals.`);
                return;
            }

            await send_message(user, 'today');
            console.warn(`${name}/${chat_id}: Read todays Meals.`);
        });


        bot.command('tomorrow', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await user_exists(chat_id);

            if(!user) {
                ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                console.warn(`${name}/${chat_id}: Failed to read tomorrows Meals.`);
                return;
            }

            await send_message(user, 'tomorrow');
            console.warn(`${name}/${chat_id}: Read tomorrows Meals.`);
        });


        bot.command('canteen', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await user_exists(chat_id);

            if(!user) {
                ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                console.warn(`${name}/${chat_id}: Failed to select new canteen.`);
                return;
            }

            ctx.reply(`\*Wähle deine Mensa aus:\*`, { parse_mode: "MarkdownV2", reply_markup: canteen_keyboard });
            console.log(`User ${name}/${chat_id}: Started selecting canteen process.`);
        });


        bot.command('allergens', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const user = await update_allergens(chat_id);

            if(!user) {
                ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                return;
            }

            if(user.allergens) {
                ctx.reply(`Du bekommst absofort alle updates \*mit\* Allergie & Inhaltsstoff Angaben\\.\n\n\*Ich übernehme keine Haftung für die vollständigkeit und die Richtigkeit dieser Daten\\. Die Daten können falsch oder unvollständig sein\\.\*`, { parse_mode: "MarkdownV2" });
            } else {
                ctx.reply(`Du bekommst absofort alle updates \*ohne\* Allergie & Inhaltsstoff Angaben\\.`, { parse_mode: "MarkdownV2" });
            }
        });


        bot.command('share', (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            ctx.replyWithPhoto(new InputFile('./img/qrcode.png'));
            console.log(`${name}/${chat_id}: Requested Sharing QR-Code.`);
        });


        bot.command('code', (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            ctx.reply('https://github.com/PhilPinsdorf/FhAachenMensaBot');
            console.log(`${name}/${chat_id}: Requested GitHub Repo.`);
        });


        bot.command('issue', (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            ctx.reply('Report your bug by createing a new Issue here:\nhttps://github.com/PhilPinsdorf/FhAachenMensaBot/issues/new\n\nAlternatively you can write @philpinsdorf on Telegram.');
            console.log(`${name}/${chat_id}: Requested Issue Page.`);
        });


        bot.command('time', async (ctx) => {
            const { chat_id, name } = get_user_info(ctx);
            const message_arguments: string[] = ctx.match.split(' ');

            if(message_arguments.length != 1) {
                ctx.reply('Um deine Zeit der Nachicht zu ändern gebe bitte den Command \*\'/time hh\\:mm\'\* ein\\. \nHierbei ist die Zeit wievolgt anzugeben\\: \n08:13, 15:42, 11:18 etc\\. \n\n\*Bitte bechachte\*\\, dass die neuen Gerichte um 3\\:00 morgens eingelesen werden\\. Anfragen davor führen dazu\\, dass du das Menü von gestern geschickt bekommst\\.', { parse_mode: "MarkdownV2" });
                console.log(`User ${name}/${chat_id}: Started Time Update Process.`);
                return;
            }

            // Check if String is formated right.
            let regex: RegExp = /[0-1][0-9]:[0-5][0-9]|2[0-3]:[0-5][0-9]/

            if(!regex.test(message_arguments[0])) {
                ctx.reply(`Die Uhrzeit wurde nicht richtig eingegeben\\! \nBitte gebe die Uhrzeit wie folgt ein\\: \n\*\'/time hh:mm\'\*\n\n\*Beispiel\\:\* '/time 08\\:45'`, { parse_mode: "MarkdownV2" });
                console.log(`${name}/${chat_id}: Tried to update time with wrong format.`);
                return;
            }
            
            const time = message_arguments[0];
            const user = await update_time(chat_id, time);

            if(!user) {
                ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                return;
            }

            ctx.reply(`Du erhältst ab sofort Updates um \*${time}\*\\!`, { parse_mode: "MarkdownV2" });
        });


        bot.callbackQuery(/update-canteen-(10|[1-9])/g, async (ctx) => {
            const chat_id = ctx.chat.id; 
            const canteen_id = Number(ctx.callbackQuery.data.substring(15));
            const user = await update_canteen(chat_id, canteen_id);

            if(!user) {
                ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                return;
            }

            const canteen = all_canteens.find(c => c.canteen_id === canteen_id);
            ctx.editMessageText(`Du erhältst ab sofort tägliche Updates von der \*${canteen.name}\*\\.`, { parse_mode: 'MarkdownV2' });
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