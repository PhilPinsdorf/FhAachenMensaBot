# FH Aachen Mensa Bot
<div>
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/philpinsdorf/fhaachenmensabot?style=for-the-badge">
  <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed-raw/philpinsdorf/FhAachenMensaBot?color=purple&style=for-the-badge">
  <img alt="GitHub" src="https://img.shields.io/github/license/philpinsdorf/fhaachenmensabot?color=red&style=for-the-badge">
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
| /start | Subscribe for daily canteen updates. |
| /stop | Unsubscribe from daily canteen updates. |
| /request | Immediately sends you todays meals. |
| /today | Immediately sends you todays meals. |
| /tomorrow | Immediately sends you tomorrows meals. |
| /select | Select your canteen. |
| /share | Get QR-Code for sharing the Bot. |
| /code | Get Link to GitHub repo. |
| /bug | Create new issue in the GitHub repo. |
| /issue | Create new issue in the GitHub repo. |
| /time | Select Time user gets the Message. |
| /owner | Get my personal information. |
| /support | Get my PayPal information. |
| /once-today | Get the option to once request todays meals for another canteen. |
| /once-tomorrow | Get the option to once request tomorrows meals for another canteen. |
| /once-everyday | Get the option to once request any days meals for another canteen. |
| /displayname | Change your personal Display Name. |
| /alergy | Receive information abeout alergeens. |


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
- [ ] Add optional Allergie tags
- [ ] Select Multiple canteens and only get the difference
- [ ] Fix /share command
- [ ] Mark Vegan and Vegetarian Meals as such
- [ ] Change Times Meals get loaded
- [ ] Send out an Update to all Users if meals change throuout the day and they already received their Message

# Far in the future
- [ ] Rate Meals and receive your rating if something simmilar is on the menu

# Please Read
The new meals are loaded at 3:00am. Any requests before that time will give you yesterdays meals.

# Author
Phil Pinsdorf