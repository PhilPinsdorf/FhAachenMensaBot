// import express from "express";
const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const express = require('express');
const schedule = require('node-schedule'); 
const Schema = mongoose.Schema;

const scraper = require('./scraper');
const request = require('request');

const bot = new Telegraf(process.env.BOT_SECRET);
const dbUri = process.env.DB_URI;

let message = ``;

const userShema = new Schema({
  chat_id: { 
    type: String,
    required: true
  },
  name: {
    type: String
  },
  joined: {
    type: Date,
    default: Date.now
  }   
});

const app = express();

const User = mongoose.model('User', userShema);

mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then((result) => {
            console.log('Connected to Database');
            app.listen(process.env.PORT || 3000, () => {
                console.log('Listen to 3000');
                parseToMessage((result) => {
                    console.log("Parsed Message on Start.");
                    startBot((result) => {
                        console.log('Started Telegram Bot');

                        // Chron Jobs jeweils minus 2 Stunden wegen anderer Zeitzone

                        schedule.scheduleJob('30 7 * * 1-5', () => { sendMessages() })
                        console.log('Started Chron Job for sending Messages');
                        schedule.scheduleJob('30 2 * * 1-5', () => { parseToMessage() }) 
                        console.log('Started Chron Job for updating Message');
                        schedule.scheduleJob('*/10 * * * *', () => { keepAlive() }) 
                        console.log('Started Chron Job for keeping Alive Backend');
                    });
                });
            });
	    })
        .catch((err) => {
		    console.log(err);
	    });

app.get('/keepAlive', (req, res) => {
    res.send('Received keep Alive Ping.');
    res.end();
});

function keepAlive() {
    request('https://fhaachenmensabot.herokuapp.com/keepAlive', (err, res, body) => {
        console.log(res.body);
    })
}

function startBot(callback) {
    bot.start((ctx) => {
        const id = ctx.message.chat.id;
        const name = ctx.message.chat.first_name;

        User.findOne({ chat_id: id }, (err, result) => {
            if (err) { throw err }

            if (!result) {
                newUser = new User({
                    chat_id: id,
                    name: name
                });

                newUser.save((err, user) => {
                    if (err) { throw err }

                    console.log(`Registered User ${name} with id ${id}`);
                    ctx.replyWithMarkdownV2(`Danke ${name}, dass du dich für den Dienst angemeldet hast\\! \n\nDu bekommst ab jetzt jeden Tag um \*9:30 Uhr\* eine Benachrichtigung darüber, was es heute in der Mensa der Eupener Straße zu essen gibt\\. Falls du zwischendurch nachgucken möchtest, was es in der Mensa gibt, kannst du das jederzeit mit /request tun\\. \n\nMit /stop kannst du dich von diesem Dienst wieder abmelden\\. \n\nBei Rückfragen oder Bugs, schreibe \\@philpinsdorf auf Telegram an\\.`);
                });

            } else {
                console.log(`User ${name} with id ${id} tried to Register again.`);
                ctx.reply(`Du hast dich bereits registriert.`);
            }
        });

    });

    bot.command('stop', (ctx) => {
        const id = ctx.message.chat.id;
        const name = ctx.message.chat.first_name;

        User.findOneAndDelete({ chat_id: id }, (err, result) => {
            if (err) { throw err }

            if (!result) {
                console.log(`User ${name} with id ${id} tried to delete a non existent account.`);
                ctx.reply(`Du hast deinen Account doch schon gelöscht!`);

            } else {
                console.log(`User ${name} with id ${id} deleted his account.`);
                ctx.replyWithMarkdownV2(`Vielen Dank ${name}, dass du meinen Dienst verwendet hast\\. \n\nDu hast hiermit deinen Account \*gelöscht\* und wirst in Zukunft \*keine Benachichtigungen\* mehr bekommen\\. \n\nFalls du dich doch umentscheiden solltest kannst du jederzeit dich mit /start \*wieder anmelden\*\\.`);
            }
        });
    });

    bot.command('request', (ctx) => {
        let id = ctx.message.chat.id;
        let name = ctx.message.chat.first_name;
        sendMessage(id, name);
    });

    bot.launch();

    callback(true);
}

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

function sendMessage(id, name) {
    bot.telegram.sendMessage(id, `Guten Morgen ${name}!\n` + message);
    console.log(`Send Message to user ${id}.`);
}

function sendMessages() {
    User.find({}, function(err, users) {
        users.forEach(function(user) {
            sendMessage(parseInt(user.chat_id), user.name);
        });
    });
}

function parseToMessage(callback){
    scraper.scrape().then((foodSelection) => {
        let header = `Heute gibt es in der Mensa: \n\n\n`;
        let body = ``;

        foodSelection.dishes.forEach((dish) => {
            let text = ``;
            text += `${dish.type}:\n`;

            let len = dish.desc.length;
            dish.desc.forEach((ingredient) => {
                text += `${ingredient}`;
                if(len == 2) {
                    text += ` und `;
                }
                if(len > 2) {
                    text += `, `;
                }
                len--;
            });

            text += ` für ${dish.price}\n\n`;

            body += text;
        });

        body += `\n`;

        body += `Hauptbeilagen:\n${foodSelection.sides[0]} oder ${foodSelection.sides[1]}\n\n`;
        body += `Nebenbeilage:\n${foodSelection.vegetables[0]} oder ${foodSelection.vegetables[1]}`;

        header += body;

        message = header;

        callback(true);
    });
}