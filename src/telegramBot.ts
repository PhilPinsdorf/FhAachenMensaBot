import { bot, sendMessage } from ".";
import { allCanteens, User } from './global';
import * as sanitize from "mongo-sanitize";
import { Markup } from "telegraf";
import { InlineKeyboardButton } from "typegram";

// Returns a promise, that starts the bot
export function startBot(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        // On start command check if User is already registered. If not, save User in Database and send welcome Text.
        bot.start((ctx) => {
            const id = ctx.message.chat.id;
            const name = sanitize(ctx.message.from.first_name);

            User.findOne({ chat_id: id }, (err, result) => {
                if (err) { throw err }

                if (!result) {
                    // Save New User and send Welcome Text
                    new User({ chat_id: id, name: name} ).save((err, user) => { if (err) { throw err } });

                    console.log(`Registered User ${name} with id ${id}`);

                    ctx.replyWithMarkdownV2(`Danke ${name}, dass du dich für den Dienst angemeldet hast\\! \n\nDu bekommst ab jetzt jeden Tag um \*9:30 Uhr\* eine Benachrichtigung darüber, was es heute in deiner Aachener Mensa zu essen gibt\\. Falls du zwischendurch nachgucken möchtest, was es heute und morgen in der Mensa gibt, kannst du das jederzeit mit /today und /tomorrow tun\\. Falls du Updates von einer anderen Mensa bekommen möchtest, kannst du deine Mensa mit /select ändern\\. Die Mensa Eupener Straße ist standartmäßig am Anfang ausgewählt\\. \n\nMit /stop kannst du dich von diesem Dienst wieder abmelden\\. \n\nBei Rückfragen oder Bugs, schreibe \\@philpinsdorf auf Telegram an\\.`);

                } else {
                    // User already registered
                    console.log(`User ${name} with id ${id} tried to Register again.`);
                    ctx.reply(`Du hast dich bereits registriert.`);
                }
            });

        });

        // On stop command check if user is registered. If he is, delete from databse.
        bot.command('stop', (ctx) => {
            const id = ctx.message.chat.id;
            const name = sanitize(ctx.message.from.first_name);

            User.findOneAndDelete({ chat_id: id }, (err, result) => {
                if (err) { throw err }

                if (!result) {
                    console.log(`User ${name} with id ${id} tried to delete a non existent account.`);
                    ctx.reply(`Du hast deinen Account doch schon gelöscht!`);

                } else {
                    console.log(`User ${name} with id ${id} deleted his account.`);

                    ctx.replyWithMarkdownV2(`Vielen Dank ${name}, dass du meinen Dienst verwendet hast\\. \n\nDu hast hiermit deinen Account \*gelöscht\* und wirst in Zukunft \*keine Benachichtigungen\* mehr bekommen\\. \n\nFalls du dich doch umentscheiden solltest kannst du jederzeit dich mit /start wieder anmelden\\.`);
                }
            });
        });

        // If user requests Data, send it to him
        bot.command(['request', 'today'], async (ctx) => {
            const id = ctx.message.chat.id;
            const name = sanitize(ctx.message.from.first_name);

            User.findOne({chat_id: id}, function (err, result) {
                if (err) { throw err }

                if(!result) {
                    ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                    console.log(`Non existent User ${id} tried to read Todays Menu!`);
                    return;
                }

                sendMessage(id, name, 'today');
            });
        });

        // If user requests Tomorrow, send it to him
        bot.command('tomorrow', async (ctx) => {
            const id = ctx.message.chat.id;
            const name = sanitize(ctx.message.from.first_name);

            User.findOne({chat_id: id}, function (err, result) {
                if (err) { throw err }

                if(!result) {
                    ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                    console.log(`Non existent User ${id} tried to read Tomrrows Menu!`);
                    return;
                }

                sendMessage(id, name, 'tomorrow');
            });
        });

        bot.command('select', (ctx) => {
            const id = ctx.message.chat.id;            
            let buttons: [InlineKeyboardButton][] = [];

            User.findOne({chat_id: id}, function (err, result) {
                if (err) { throw err }

                if(!result) {
                    ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                    console.log(`Non existent User ${id} tried to read Tomrrows Menu!`);
                    return;
                }

                for(let canteen of allCanteens) {
                    buttons.push([Markup.button.callback(canteen.name, `canteen-${canteen.canteen_id}`)]);
                }

                const inlineMessageKeyboard = Markup.inlineKeyboard(buttons);

                ctx.replyWithMarkdownV2(`\*Wähle deine Mensa aus:\*`, inlineMessageKeyboard);
            });
        });

        bot.command('share', (ctx) => {
            ctx.replyWithPhoto({ source: './img/qrcode.png' });
        });

        bot.command('code', (ctx) => {
            ctx.reply('https://github.com/PhilPinsdorf/FhAachenMensaBot');
        });

        bot.command(['bug', 'issue'], (ctx) => {
            ctx.reply('https://github.com/PhilPinsdorf/FhAachenMensaBot/issues/new');
        });

        bot.action(/canteen-([1-6])/g, (ctx) => {
            const id = ctx.chat.id;      
            const canteen_id = ctx.match[0][8];
            
            User.findOneAndUpdate({chat_id: id}, {canteen_id: canteen_id}, function (err, result) {
                if (err) { throw err }

                if(!result) {
                    ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                    console.log(`Non existent User ${id} tried to update Canteen ID!`);
                    return;
                }

                let canteenName: string;
                for(let canteen of allCanteens) {
                    if(canteen.canteen_id == Number(canteen_id)) {
                        canteenName = canteen.name;
                        break;
                    }
                }

                if(result.canteen_id == canteen_id) {
                    ctx.editMessageText(`Deine Mensa hat sich nicht verändert\\! Du erhältst weiterhin Updates für die \*${canteenName}\*\\!`, { parse_mode: 'MarkdownV2' });
                    return;
                }

                ctx.editMessageText(`Deine Mensa wurde erfolgreich auf die \*${canteenName}\* geändert\\! Du erhältst ab sofort tägliche Updates von dieser Mensa\\.`, { parse_mode: 'MarkdownV2' });
            });
        });

        bot.launch();

        resolve();
    });
}
