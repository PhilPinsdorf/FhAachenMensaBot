import { bot, sendMessage } from ".";
import { allCanteens, User } from './global';
import * as sanitize from "mongo-sanitize";

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

                    ctx.replyWithMarkdownV2(`Danke ${name}, dass du dich für den Dienst angemeldet hast\\! \n\nDu bekommst ab jetzt jeden Tag um \*9:30 Uhr\* eine Benachrichtigung darüber, was es heute in der Mensa der Eupener Straße zu essen gibt\\. Falls du zwischendurch nachgucken möchtest, was es in der Mensa gibt, kannst du das jederzeit mit /request tun\\. \n\nMit /stop kannst du dich von diesem Dienst wieder abmelden\\. \n\nBei Rückfragen oder Bugs, schreibe \\@philpinsdorf auf Telegram an\\.`);

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
            const commandArguments: string[] = ctx.update.message.text.split(' ');
            const canteen_id = commandArguments[1];

            if(canteen_id && (isNaN(Number(canteen_id)) || Number(canteen_id) < 1 || Number(canteen_id) > 6)) {
                ctx.reply('Der Command ist so nicht gültig! Bitte wähle eine der Mensen aus!');
                return;
            }
            
            if(!canteen_id){
                let text: string = `\*Wähle deine Mensa aus:\*\n\n`;
                for(let canteen of allCanteens) {
                    text += `\*${canteen.name}:\* /\{select ${canteen.canteen_id}\} \n`;
                }

                ctx.replyWithMarkdownV2(text);
                return;
            }

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

                ctx.replyWithMarkdownV2(`Deine Mensa wurde erfolgreich auf die \*${canteenName}\* geändert\\! Du erhältst ab sofort tägliche Updates von dieser Mensa\\.`);
            });
        });

        bot.launch();

        resolve();
    });
}

async function userExists(id: string): Promise<boolean> {
    let bool: boolean;

    

    return bool;
}
