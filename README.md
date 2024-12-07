# FH Aachen Mensa Bot
<div>
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/philpinsdorf/fhaachenmensabot?style=for-the-badge">
  <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed-raw/philpinsdorf/FhAachenMensaBot?color=purple&style=for-the-badge">
  <img alt="GitHub" src="https://img.shields.io/github/license/philpinsdorf/fhaachenmensabot?color=red&style=for-the-badge">
  <img alt="Lines of code" src="https://img.shields.io/endpoint?url=https://ghloc.vercel.app/api/PhilPinsdorf/FhAachenMensaBot/badge?filter=.ts$,&style=for-the-badge&color=8800ff&label=Lines%20of%20Code">
</div>  

</br>

A small Telegram bot that will send you a message with the canteen meals of the day. \
Now working for all Canteens in Aachen. \
Feel free to create pull-requests.

# How to use
Follow this link: https://t.me/fhaachenmensabot \
Press on **Start** \
You'll get all relevant information through the bot.

# Commands
| Command | Description |
|---|---|
| /start | Subscribe to daily canteen updates. |
| /stop | Unsubscribe from daily canteen updates. |
| /request | Immediately sends you todays meals. |
| /today | Immediately sends you todays meals. |
| /tomorrow | Immediately sends you tomorrows meals. |
| /canteen | Select your canteen. |
| /allergens | Receive information abeout allergens. |
| /share | Get a QR-Code for sharing the Bot. |
| /code | Get Link to GitHub repo. |
| /issue | Create new issue in the GitHub repo. |
| /time | Select Time user gets the Message. |
| /owner | Get my personal information. (Coming Soon) |
| /support | Get my PayPal information. (Coming Soon) |
| /once-today | Get the option to once request todays meals for another canteen. (Coming Soon) |
| /once-tomorrow | Get the option to once request tomorrows meals for another canteen. (Coming Soon) |
| /once-everyday | Get the option to once request any days meals for another canteen. (Coming Soon) |
| /displayname | Change your personal Display Name. (Coming Soon) |


# ToDo
- [x] Clean up code
- [x] Sanitize usernames
- [x] Rewrite in TypeScript
- [x] Select your canteen
- [x] Add all canteens in Aachen
- [x] Get tomorrows Meals
- [x] Request QR-Code for sharing
- [x] User gets Link to Issue page.
- [x] User can select time, when they want to receive their Message.
- [ ] Add Broadcast Tool for Admin Messages
- [ ] Add Day Seletion
- [ ] Add daily Admin Stats
- [ ] Send Opening Times of Selected Canteen
- [ ] Request messages once for a different canteen
- [ ] Get error messages when Bot is down
- [ ] Make it an option to update the display Name
- [x] Add optional Allergie tags
- [ ] Select Multiple canteens and only get the difference
- [x] Fix /share command
- [x] Mark Vegan and Vegetarian Meals as such
- [x] Change Times Meals get loaded
- [ ] Send out an Update to all Users if meals change throuout the day and they already received their Message

# Far in the future
- [ ] Rate Meals and receive your rating if something simmilar is on the menu

# Please Read
The new meals are loaded at 3:00am. Any requests before that time will give you yesterdays meals.

# Author
Phil Pinsdorf