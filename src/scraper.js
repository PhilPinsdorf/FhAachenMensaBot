const request = require('request');
const cheerio = require('cheerio');

function scrape() {
    return new Promise(function (resolve, reject) {
        request({uri: "https://www.studierendenwerk-aachen.de/speiseplaene/eupenerstrasse-w.html"}, (error, response, body) => {
            const $ = cheerio.load(body);

            const foodSelection = {
                dishes: getDishes($),
                sides: getMainSides($),
                vegetables: getFurtherSides($)
            }

            resolve(foodSelection);
        });
    });
} 

function getDishes($) {
    const len = $('.active-panel > table.menues > tbody > tr').length;
    let dishes = [];
    for(let i = 1; i < (len + 1); i++){
        const type = $(`.active-panel > table.menues > tbody > tr:nth-child(${i}) > td.menue-wrapper > span.menue-item.menue-category`).text(); 
        let desc = $(`.active-panel > table.menues > tbody > tr:nth-child(${i}) > td.menue-wrapper > span.menue-item.menue-desc > span.expand-nutr`).clone().children().remove().end().text(); 
        desc = desc.split(' | ').map(elem => elem.trim()).map(elem => elem.replace('-', '\\-'));
        const price = $(`.active-panel > table.menues > tbody > tr:nth-child(${i}) > td.menue-wrapper > span.menue-item.menue-price.large-price`).text(); 

        let dish = {
            type: type,
            desc: desc,
            price: price
        };

        dishes.push(dish);
    }

    return dishes;
}

function getMainSides($) {
    $('.active-panel > table.extras > tbody > tr:nth-child(1) > td.menue-wrapper > span.menue-item.extra.menue-desc > .seperator').replaceWith(',');
    let mainSides = $('.active-panel > table.extras > tbody > tr:nth-child(1) > td.menue-wrapper > span.menue-item.extra.menue-desc').clone().children().remove().end().text();
    return mainSides.split(',').map(elem => elem.trim()).map(elem => elem.replace('-', '\\-'));
}

function getFurtherSides($) {
    $('.active-panel > table.extras > tbody > tr:nth-child(2) > td.menue-wrapper > span.menue-item.extra.menue-desc > .seperator').replaceWith(',');
    let mainSides = $('.active-panel > table.extras > tbody > tr:nth-child(2) > td.menue-wrapper > span.menue-item.extra.menue-desc').clone().children().remove().end().text();
    return mainSides.split(',').map(elem => elem.trim()).map(elem => elem.replace('-', '\\-'));
}

module.exports.scrape = scrape;