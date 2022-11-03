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

                    console.log(`User ${name}/${id}: Registered.`);

                    ctx.replyWithMarkdownV2(`Danke ${name}, dass du dich für den Dienst angemeldet hast\\! \n\nDu bekommst ab jetzt jeden Tag um \*9:30 Uhr\* eine Benachrichtigung darüber, was es heute in deiner Aachener Mensa zu essen gibt\\. Falls du zwischendurch nachgucken möchtest, was es heute und morgen in der Mensa gibt, kannst du das jederzeit mit /today und /tomorrow tun\\. Falls du Updates von einer anderen Mensa bekommen möchtest, kannst du deine Mensa mit /select ändern\\. Die Mensa Eupener Straße ist standartmäßig am Anfang ausgewählt\\. Falls du Updates zu einer anderen Zeit bekommen möchtest, kannst du deine Zeit mit /time ändern\\. \n\nMit /stop kannst du dich von diesem Dienst wieder abmelden\\. \n\nBei Rückfragen oder Bugs, schreibe \\@philpinsdorf auf Telegram an\\.`);

                } else {
                    // User already registered
                    console.log(`User ${name}/${id}: Tried to register again.`);
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
                    console.log(`Non Existent User ${name}/${id}: Tried to delete Account.`);
                    ctx.reply(`Du hast deinen Account doch schon gelöscht!`);

                } else {
                    console.log(`User ${name}/${id}: Deleted Account.`);;

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
                    console.log(`Non Existent User ${name}/${id}: Tried to read todays Meal.`);
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
                    console.log(`Non Existent User ${name}/${id}: Tried to read tomorrows Meal.`);
                    return;
                }

                sendMessage(id, name, 'tomorrow');
            });
        });

        bot.command('select', (ctx) => {
            const id = ctx.message.chat.id;   
            const name = ctx.message.from.first_name;         
            let buttons: [InlineKeyboardButton][] = [];

            User.findOne({chat_id: id}, function (err, result) {
                if (err) { throw err }

                if(!result) {
                    ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                    console.log(`Non Existent User ${name}/${id}: Tried to select Canteen.`);
                    return;
                }

                for(let canteen of allCanteens) {
                    buttons.push([Markup.button.callback(canteen.name, `canteen-${canteen.canteen_id}`)]);
                }

                const inlineMessageKeyboard = Markup.inlineKeyboard(buttons);

                ctx.replyWithMarkdownV2(`\*Wähle deine Mensa aus:\*`, inlineMessageKeyboard);
                console.log(`User ${name}/${id}: Started Selecting Process.`);
            });
        });

        bot.command('share', (ctx) => {
            const id = ctx.message.chat.id;   
            const name = ctx.message.from.first_name;  
            ctx.replyWithPhoto({ source: './img/qrcode.png' });
            console.log(`User ${name}/${id}: Requested Sharing QR-Code.`);
        });

        bot.command('code', (ctx) => {
            const id = ctx.message.chat.id;   
            const name = ctx.message.from.first_name;  
            ctx.reply('https://github.com/PhilPinsdorf/FhAachenMensaBot');
            console.log(`User ${name}/${id}: Requested GitHub Repo.`);
        });

        bot.command(['bug', 'issue'], (ctx) => {
            const id = ctx.message.chat.id;   
            const name = ctx.message.from.first_name;  
            ctx.reply('Report your bug by createing a new Issue here:\n\nhttps://github.com/PhilPinsdorf/FhAachenMensaBot/issues/new');
            console.log(`User ${name}/${id}: Requested Issue Page.`);
        });

        bot.command('/time', (ctx) => {
            const id = ctx.message.chat.id;   
            const name = ctx.message.from.first_name; 
            let messageArray: string[] = ctx.message.text.split(' ');

            if(messageArray[1]) {
                // Check if String is formated right.
                let regex: RegExp = /[0-1][0-9]:[0-5][0-9]|2[0-3]:[0-5][0-9]/

                if(regex.test(messageArray[1])) {
                    let newTime = messageArray[1].match(regex)[0];
                    User.findOneAndUpdate({chat_id: id}, {time: newTime}, function (err, result) {
                        if (err) { throw err }

                        if(!result) {
                            ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                            console.log(`Non Existent User ${name}/${id}: Tried to update Time.`);
                            return;
                        }

                        if(result.time == newTime) {
                            ctx.replyWithMarkdownV2(`Deine Zeit hat sich nicht verändert\\! Du erhältst weiterhin Updates um \*${result.time}\*\\!`);
                            console.log(`User ${name}/${id}: Tried to update to same Time.`);
                            return;
                        }

                        ctx.replyWithMarkdownV2(`Du erhältst ab sofort Updates um \*${newTime}\*\\!`);
                        console.log(`User ${name}/${id}: Updated Time to ${newTime}.`);
                    });
                } else {
                    ctx.replyWithMarkdownV2(`Die Uhrzeit wurde nicht richtig eingegeben\\! \nBitte gebe die Uhrzeit wie folgt ein\\: \n\*\'/time hh:mm\'\*\n\n\*Beispiel\\:\* '/time 08\\:45'`);
                    console.log(`User ${name}/${id}: Tried to update Time with wrong format.`);
                }

            } else {
                ctx.replyWithMarkdownV2('Um deine Zeit der Nachicht zu ändern gebe bitte den Command \*\'/time hh\\:mm\'\* ein\\. \nHierbei ist die Zeit wievolgt anzugeben\\: \n08:13, 15:42, 11:18 etc\\. \n\n\*Bitte bechachte\*\\, dass die neuen Gerichte um 4\\:30 morgens eingelesen werden\\. Anfragen davor führen dazu\\, dass du das Menü von gestern geschickt bekommst\\.');
                console.log(`User ${name}/${id}: Started Time Update Process.`);
            }
        })

        bot.action(/canteen-([1-6])/g, (ctx) => {
            const id = ctx.chat.id; 
            const name = ctx.from.first_name;     
            const canteen_id = ctx.match[0][8];
            
            User.findOneAndUpdate({chat_id: id}, {canteen_id: canteen_id}, function (err, result) {
                if (err) { throw err }

                if(!result) {
                    ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                    console.log(`Non Existent User ${name}/${id}: Tried to update Canteen.`);
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
                    console.log(`User ${name}/${id}: Tried to update to same Canteen.`);
                    return;
                }

                ctx.editMessageText(`Deine Mensa wurde erfolgreich auf die \*${canteenName}\* geändert\\! Du erhältst ab sofort tägliche Updates von dieser Mensa\\.`, { parse_mode: 'MarkdownV2' });
                console.log(`User ${name}/${id}: Updated Canteen to ${canteenName}.`);
            });
        });

        bot.launch();

        resolve();
    });
}
