# FH Aachen Mensa Bot
<div>
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/philpinsdorf/fhaachenmensabot?style=for-the-badge">
  <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed-raw/philpinsdorf/FhAachenMensaBot?color=purple&style=for-the-badge">
  <img alt="GitHub" src="https://img.shields.io/github/license/philpinsdorf/fhaachenmensabot?color=red&style=for-the-badge">
  <img alt="Lines of code" src="https://img.shields.io/endpoint?url=https://ghloc.vercel.app/api/PhilPinsdorf/FhAachenMensaBot/badge?filter=.ts$,&style=for-the-badge&color=8800ff&label=Lines%20of%20Code">
</div>  

</br>

A Telegram bot that will inform you about the canteen meals of the day. \
Now working for all Canteens in Aachen. \
Feel free to create pull-requests.

## Getting started
> [!TIP]
> Follow this link: https://t.me/fhaachenmensabot \
> Press on **Start** or type **/start** \
> You'll get all relevant information to get started through the bot. 

## Commands
| Command | Description | Implemented |
|---|---|---|
| /start | Subscribe to daily canteen updates. | ✅ |
| /stop | Unsubscribe from daily canteen updates. | ✅ |
| /request | Immediately sends you todays meals. | ✅ |
| /today | Immediately sends you todays meals. | ✅ |
| /tomorrow | Immediately sends you tomorrows meals. | ✅ |
| /canteen | Select your canteen. | ✅ |
| /allergens | Receive information abeout allergens. | ✅ |
| /share | Get a QR-Code for sharing the Bot. | ✅ |
| /code | Get Link to GitHub repo. | ✅ |
| /issue | Create new issue in the GitHub repo. | ✅ |
| /time | Select Time user gets the Message. | ✅ |
| /owner | Get my personal information. | ❌ |
| /support | Get my PayPal information. | ❌ |
| /once-today | Get the option to once request todays meals for another canteen. | ❌ |
| /once-tomorrow | Get the option to once request tomorrows meals for another canteen. | ❌ |
| /once-everyday | Get the option to once request any days meals for another canteen. | ❌ |
| /displayname | Change your personal Display Name. | ❌ |


## ToDo
- [x] Clean up code
- [x] Sanitize usernames
- [x] Rewrite in TypeScript
- [x] Select your canteen
- [x] Add all canteens in Aachen
- [x] Get tomorrows Meals
- [x] Request QR-Code for sharing
- [x] User gets Link to Issue page.
- [x] User can select time, when they want to receive their Message.
- [x] Add Broadcast Tool for Admin Messages
- [x] Add optional Allergie tags
- [x] Fix /share command
- [x] Mark Vegan and Vegetarian Meals as such
- [x] Change Times Meals get loaded
- [x] Delete users, that blocked the Bot
- [ ] Add Day Seletion
- [ ] Add daily Admin Stats
- [ ] Send Opening Times of Selected Canteen
- [ ] Request messages once for a different canteen
- [ ] Get error messages when Bot is down
- [ ] Make it an option to update the display Name
- [ ] Select Multiple canteens and only get the difference
- [ ] Send out an Update to all Users if meals change throuout the day and they already received their Message

## Far in the future
- [ ] Rate Meals and receive your rating if something simmilar is on the menu

## Important information
> [!CAUTION]
> The new meals are loaded at **3:00am**. Any requests before that time will **give you yesterdays meals**.

## Version
v2.0.0

## Author
[Phil Pinsdorf](https://github.com/PhilPinsdorf)