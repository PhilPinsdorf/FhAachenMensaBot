import { mealsToday, mealsTomorrow } from "./requestMeals";
import { allCanteens, Menue } from "./global";

const formatter = Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

// Object with all completely parsed Messages
export let finalMessagesToday: {[key: string]: string} = {};
export let finalMessagesTomorrow: {[key: string]: string} = {};


// Parse all Messages for all canteens
export function parseMessages() {
    for(let canteen of allCanteens) {
        let messageToday = parseToMessage(mealsToday[canteen.canteen_id], canteen.name);
        let escapedToday = escapeMessage(messageToday);
        finalMessagesToday[canteen.canteen_id] = escapedToday;

        let messageTomorrow = parseToMessage(mealsTomorrow[canteen.canteen_id], canteen.name);
        let escapedTomorrow = escapeMessage(messageTomorrow);
        finalMessagesTomorrow[canteen.canteen_id] = escapedTomorrow;
    }
}

// Create Message from parsed Information
function parseToMessage(menu: Menue, name: string): string{
    let message = `\*Heute gibt es in der ${name}:\* \n\n\n`;

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
    return message.replace(/[.-+?^${}()|[\]\\]/g, '\\\\$&');
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
