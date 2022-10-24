"use strict";
exports.__esModule = true;
exports.User = exports.allCanteens = void 0;
var mongoose_1 = require("mongoose");
exports.allCanteens = [
    {
        name: "Mensa Academica",
        api_id: 187,
        canteen_id: 1
    },
    {
        name: "Mensa Vita",
        api_id: 96,
        canteen_id: 2
    },
    {
        name: "Mensa Ahorn",
        api_id: 95,
        canteen_id: 3
    },
    {
        name: "Mensa Bistro Tempelgraben",
        api_id: 94,
        canteen_id: 4
    },
    {
        name: "Mensa Eupener Straße",
        api_id: 98,
        canteen_id: 5
    },
    {
        name: "Mensa Bayernallee",
        api_id: 97,
        canteen_id: 6
    },
];
var userShema = new mongoose_1.Schema({
    chat_id: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    joined: {
        type: Date,
        "default": Date.now
    },
    canteen_id: {
        type: Number,
        required: true
    }
});
exports.User = (0, mongoose_1.model)('User', userShema);
