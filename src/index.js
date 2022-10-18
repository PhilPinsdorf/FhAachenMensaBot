// import express from "express";
const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const express = require('express');
const schedule = require('node-schedule'); 
const Schema = mongoose.Schema;

const scraper = require('./scraper');

const bot = new Telegraf(process.env.BOT_SECRET);
const dbUri = process.env.DB_URI;

let message = ``;

const userShema = new Schema({
  chat_id: { 
    type: String,
    required: true
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
            startBot();
            console.log('Started Telegram Bot');
            app.listen(process.env.PORT || 3000, () => console.log('Listen to 3000'));
            parseToMessage();
            console.log("Parsed Message on Start.");
            schedule.scheduleJob('30 10 * * *', () => { sendMessages() })
            console.log('Started Chron Job for sending Messages');
            schedule.scheduleJob('30 4 * * *', () => { parseToMessage() }) 
            console.log('Started Chron Job for updating Message');
	    })
        .catch((err) => {
		    console.log(err);
	    });


function startBot() {
    bot.start((ctx) => {
        const id = ctx.message.chat.id;
        const name = ctx.message.chat.first_name;

        User.findOne({ chat_id: id }, (err, result) => {
            if (err) { throw err }

            if (!result) {
                newUser = new User({
                    chat_id: id
                });

                newUser.save((err, user) => {
                    if (err) { throw err }

                    console.log(`Registered User ${name} with id ${id}`);
                    ctx.replyWithMarkdownV2(`Danke \*${name}\*, dass du dich für den Dienst angemeldet hat\\! \n\nDu bekommst ab jetzt jeden Tag um \*10:30 Uhr\* eine Benachichtigung darüber, was es heute in der Mensa der Eupener Straße zu essen gibt\\. Falls du zwischendurch nachgucken möchtest, was es in der Mensa gibt kannst du das jederzeit mit /request tun\\. \n\nWenn du dich von diesem Dienst abmelden möchtest kannst du dies mit /stop tun\\.`);
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
                ctx.replyWithMarkdownV2(`Vielen Dank \*${name}\*, dass du meinen Dienst verwendet hast\\. \n\nDu hast hiermit deinen Account \*gelöscht\* und wirst in Zukunft \*keine Benachichtigungen\* mehr bekommen\\. \n\nFalls du dich doch umentscheiden solltest kannst du jederzeit dich mit /start \*wieder anmelden\*\\.`);
            }
        });
    });

    bot.command('request', (ctx) => {
        sendMessage(ctx.message.chat.id);
    });

    bot.launch();
}

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

function sendMessage(id) {
    bot.telegram.sendMessage(id, message, { parse_mode: "MarkdownV2" });
    console.log(`Send Message to user ${id}.`);
}

function sendMessages() {
    User.find({}, function(err, users) {
        users.forEach(function(user) {
            sendMessage(parseInt(user.chat_id));
        });
    });
}

function parseToMessage(){
    scraper.scrape().then((foodSelection) => {
        let header = `\*Heute gibt es in der Mensa:\* \n\n\n`;
        let body = ``;

        foodSelection.dishes.forEach((dish) => {
            let text = ``;
            text += `\*${dish.type}\*\\:\n`;

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

            text += ` für \*${dish.price}\*\n\n`;

            body += text;
        });

        body += `\n`;

        body += `\*Hauptbeilagen\*\\:\n${foodSelection.sides[0]} oder ${foodSelection.sides[1]}\n\n`;
        body += `\*Nebenbeilage\*\\:\n${foodSelection.vegetables[0]} oder ${foodSelection.vegetables[1]}`;

        header += body;

        message = header;
    });
}