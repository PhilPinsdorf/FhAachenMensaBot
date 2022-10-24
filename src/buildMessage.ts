import { mealsToday, mealsTomorrow } from "./requestMeals";
import { allCanteens, Menue } from "./global";
import * as moment from 'moment';


// Object with all completely parsed Messages
export let finalMessages: {[key: string]: {[key: string]: string}} = {};

// Parse all Messages for all canteens
export function parseMessages() {
    finalMessages = {};

    for(let canteen of allCanteens) {
        let messageToday = parseToMessage(mealsToday[canteen.canteen_id], canteen.name, false);
        let escapedToday = escapeMessage(messageToday);
        finalMessages['today'] = {};
        finalMessages['today'][canteen.canteen_id] = escapedToday;

        let messageTomorrow = parseToMessage(mealsTomorrow[canteen.canteen_id], canteen.name, true);
        let escapedTomorrow = escapeMessage(messageTomorrow);
        finalMessages['tomorrow'] = {};
        finalMessages['tomorrow'][canteen.canteen_id] = escapedTomorrow;
    }

    console.log(finalMessages);
}

// Create Message from parsed Information
function parseToMessage(menu: Menue, name: string, writeDay: boolean): string{
    let message: string = ``;
    if(writeDay) {
        message += getDay();
    } else {
        message += `Heute`;
    }

    message += `\* gibt es in der ${name}:\* \n\n\n`;

    for (let meal of menu.meals) {
        let priceString: string = Number(meal.price).toFixed(2).replace('.', ',') + ' €';
        let description: string = createMealDescription(meal.description);

        message += `\*${meal.category}:\*\n`;
        message += `${description} für ${priceString}`;

        message += '\n\n'
    }

    message += `\n`;

    message += `\*Hauptbeilagen\*:\n${menu.sides}\n\n`;
    message += `\*Nebenbeilage\*:\n${menu.vegetables}`;

    return message;
}

// Escape all special characters
function escapeMessage(message: string): string {
    return message.replace(/[.\-+?^${}()|[\]\\]/g, '\\$&');
}

// Create a more readable Menue: abc | def | ghi  =>  abc, def dazu ghi
function createMealDescription(description: string): string {
    let parts: string[] = description.split(' | ');
    parts.map((element) => { element.trim() });

    let text: string = "";
    let len: number = parts.length;

    for(let part of parts) {
        text += part;

        if(len > 2) {
            text += ", ";
        }

        if(len == 2) {
            text += " dazu ";
        }

        len--;
    }

    return text;
}

function getDay(): string {
    let day: string;

    moment.locale('de')
    switch (moment().day()) {
        case 5:
            day = moment().add(3, 'days').format("dddd");
            break;
        case 6:
            day = moment().add(2, 'days').format("dddd");
            break;
        default:
            day = moment().add(1, 'days').format("dddd");
            break;
    }

    return day;
}
