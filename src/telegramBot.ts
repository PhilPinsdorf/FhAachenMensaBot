import { bot, sendMessage } from ".";
import { allCanteens, User } from './global';
import * as sanitize from "mongo-sanitize";
import { InlineKeyboard } from "grammy";

// Returns a promise, that starts the bot
export function startBot(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        // On start command check if User is already registered. If not, save User in Database and send welcome Text.
        bot.command('start', (ctx) => {
            const id = ctx.message.chat.id;
            const name = sanitize(ctx.message.from.first_name);

            User.findOne({ chat_id: id }).then( doc => {
                if(!doc) {
                    // Save New User and send Welcome Text
                    new User({ chat_id: id, name: name} ).save().then( doc => {
                        console.log(`User ${name}/${id}: Registered.`);
                        ctx.reply(`Danke ${name}, dass du dich für den Dienst angemeldet hast\\! \n\nDu bekommst ab jetzt jeden Tag um \*9:30 Uhr\* eine Benachrichtigung darüber, was es heute in deiner Aachener Mensa zu essen gibt\\. Falls du zwischendurch nachgucken möchtest, was es heute und morgen in der Mensa gibt, kannst du das jederzeit mit /today und /tomorrow tun\\. Falls du Updates von einer anderen Mensa bekommen möchtest, kannst du deine Mensa mit /select ändern\\. Die Mensa Eupener Straße ist standartmäßig am Anfang ausgewählt\\. Falls du Updates zu einer anderen Zeit bekommen möchtest, kannst du deine Zeit mit /time ändern\\. \n\nMit /stop kannst du dich von diesem Dienst wieder abmelden\\. \n\nBei Rückfragen oder Bugs, schreibe \\@philpinsdorf auf Telegram an\\.`, { parse_mode: "MarkdownV2" });
                    }).catch(err => {
                        console.log(`Couldn't register User ${name}/${id}: ${err}.`);
                    });
                    return;
                }

                // User already registered
                console.log(`User ${name}/${id}: Tried to register again.`);
                ctx.reply(`Du hast dich bereits registriert.`);
            }).catch( err => {
                console.log(`Error on /start: \n ${err}`);
            });
        });

        // On stop command check if user is registered. If he is, delete from databse.
        bot.command('stop', (ctx) => {
            const id = ctx.message.chat.id;
            const name = sanitize(ctx.message.from.first_name);

            User.findOneAndDelete({ chat_id: id }).then( doc => {
                if (doc) {
                    ctx.reply(`Vielen Dank ${name}, dass du meinen Dienst verwendet hast\\. \n\nDu hast hiermit deinen Account \*gelöscht\* und wirst in Zukunft \*keine Benachichtigungen\* mehr bekommen\\. \n\nFalls du dich doch umentscheiden solltest kannst du jederzeit dich mit /start wieder anmelden\\.`, { parse_mode: "MarkdownV2" });
                    console.log(`User ${name}/${id}: Deleted Account.`);
                    return;
                }

                ctx.reply(`Du hast deinen Account doch schon gelöscht!`);
                console.log(`Non Existent User ${name}/${id}: Tried to delete Account.`);
            }).catch( err => {
                console.log(`Error on /stop: \n ${err}`);
            });
        });

        // If user requests Data, send it to him
        bot.command(['request', 'today'], async (ctx) => {
            const id = ctx.message.chat.id;
            const name = sanitize(ctx.message.from.first_name);

            User.findOne({chat_id: id}).then( doc => {
                if(!doc) {
                    ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                    console.log(`Non Existent User ${doc.name}/${doc.chat_id}: Tried to read todays Meal.`);
                    return;
                }

                sendMessage(Number(doc.chat_id), doc.name, 'today', doc.canteen_id);
            }).catch( err => {
                console.log(`Error on /request | /today: \n ${err}`);
            });
        });

        // If user requests Tomorrow, send it to him
        bot.command('tomorrow', async (ctx) => {
            const id = ctx.message.chat.id;
            const name = sanitize(ctx.message.from.first_name);

            User.findOne({chat_id: id}).then( doc => {
                if(!doc) {
                    ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                    console.log(`Non Existent User ${doc.name}/${doc.chat_id}: Tried to read tomorrows Meal.`);
                    return;
                }

                sendMessage(Number(doc.chat_id), doc.name, 'tomorrow', doc.canteen_id);
            }).catch( err => {
                console.log(`Error on /tomorrow: \n ${err}`);
            });
        });

        bot.command('select', (ctx) => {
            const id = ctx.message.chat.id;   
            const name = ctx.message.from.first_name;   
            const keyboardButtons = []

            for(let canteen of allCanteens) {
                keyboardButtons.push([InlineKeyboard.text(canteen.name, `canteen-${canteen.canteen_id}`)]);
            }

            const keyboard = InlineKeyboard.from(keyboardButtons)

            User.findOne({chat_id: id}).then( doc => {
                if(!doc) {
                    ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                    console.log(`Non Existent User ${name}/${id}: Tried to select Canteen.`);
                    return;
                }

                ctx.reply(`\*Wähle deine Mensa aus:\*`, { parse_mode: "MarkdownV2", reply_markup: keyboard });
                console.log(`User ${name}/${id}: Started Selecting Process.`);
            }).catch( err => {
                console.log(`Error on /select: \n ${err}`);
            });
        });

        bot.command('share', (ctx) => {
            const id = ctx.message.chat.id;   
            const name = ctx.message.from.first_name;  
            ctx.replyWithPhoto('../img/qrcode.png');
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

        bot.command('time', (ctx) => {
            const id = ctx.message.chat.id;   
            const name = ctx.message.from.first_name; 
            let messageArray: string[] = ctx.message.text.split(' ');

            if(messageArray[1]) {
                // Check if String is formated right.
                let regex: RegExp = /[0-1][0-9]:[0-5][0-9]|2[0-3]:[0-5][0-9]/

                if(regex.test(messageArray[1])) {
                    let newTime = messageArray[1].match(regex)[0];
                    User.findOneAndUpdate({chat_id: id}, {time: newTime}).then( doc => {
                        if(!doc) {
                            ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                            console.log(`Non Existent User ${name}/${id}: Tried to update Time.`);
                            return;
                        }

                        if(doc.time == newTime) {
                            ctx.reply(`Deine Zeit hat sich nicht verändert\\! Du erhältst weiterhin Updates um \*${doc.time}\*\\!`, { parse_mode: "MarkdownV2" });
                            console.log(`User ${name}/${id}: Tried to update to same Time.`);
                            return;
                        }

                        ctx.reply(`Du erhältst ab sofort Updates um \*${newTime}\*\\!`, { parse_mode: "MarkdownV2" });
                        console.log(`User ${name}/${id}: Updated Time to ${newTime}.`);
                    }).catch( err => {
                        console.log(`Error on /time: \n ${err}`);
                    });
                } else {
                    ctx.reply(`Die Uhrzeit wurde nicht richtig eingegeben\\! \nBitte gebe die Uhrzeit wie folgt ein\\: \n\*\'/time hh:mm\'\*\n\n\*Beispiel\\:\* '/time 08\\:45'`, { parse_mode: "MarkdownV2" });
                    console.log(`User ${name}/${id}: Tried to update Time with wrong format.`);
                }

            } else {
                ctx.reply('Um deine Zeit der Nachicht zu ändern gebe bitte den Command \*\'/time hh\\:mm\'\* ein\\. \nHierbei ist die Zeit wievolgt anzugeben\\: \n08:13, 15:42, 11:18 etc\\. \n\n\*Bitte bechachte\*\\, dass die neuen Gerichte um 4\\:30 morgens eingelesen werden\\. Anfragen davor führen dazu\\, dass du das Menü von gestern geschickt bekommst\\.', { parse_mode: "MarkdownV2" });
                console.log(`User ${name}/${id}: Started Time Update Process.`);
            }
        })

        bot.callbackQuery(/canteen-([1-6])/g, (ctx) => {
            const id = ctx.chat.id; 
            const name = ctx.from.first_name;     
            const canteen_id = Number(ctx.match[0][8]);
            
            User.findOneAndUpdate({chat_id: id}, {canteen_id: canteen_id}).then( doc => {
                if(!doc) {
                    ctx.reply('Du musst diesen Dienst erst mit /start abbonieren!');
                    console.log(`Non Existent User ${name}/${id}: Tried to update Canteen.`);
                    return;
                }

                let canteenName: string;
                for(let canteen of allCanteens) {
                    if(canteen.canteen_id == canteen_id) {
                        canteenName = canteen.name;
                        break;
                    }
                }

                if(doc.canteen_id == canteen_id) {
                    ctx.editMessageText(`Deine Mensa hat sich nicht verändert\\! Du erhältst weiterhin Updates für die \*${canteenName}\*\\!`, { parse_mode: 'MarkdownV2' });
                    console.log(`User ${name}/${id}: Tried to update to same Canteen.`);
                    return;
                }

                ctx.editMessageText(`Deine Mensa wurde erfolgreich auf die \*${canteenName}\* geändert\\! Du erhältst ab sofort tägliche Updates von dieser Mensa\\.`, { parse_mode: 'MarkdownV2' });
                console.log(`User ${name}/${id}: Updated Canteen to ${canteenName}.`);
            }).catch( err => {
                console.log(`Error on /select callback: \n ${err}`);
            });
        });

        bot.start();

        resolve();
    });
}
