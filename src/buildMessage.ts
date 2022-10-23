import { information } from "./requestMeals";
import { allCanteens, Menue } from "./global";

const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

// Object with all completely parsed Messages
export let finalMessages: {[key: string]: string} = {};

// Parse all Messages for all canteens
export function parseMessages() {
    for(let canteen of allCanteens) {
        let message = parseToMessage(information[canteen.canteen_id], canteen.name);
        let escaped = escapeMessage(message);
        finalMessages[canteen.canteen_id] = escaped;
    }
}

// Create Message from parsed Information
function parseToMessage(menu: Menue, name: string): string{
    let message = `\*Heute gibt es in der ${name}:\* \n\n\n`;

    for (let meal of menu.meals) {
        let price: string = formatter.format(meal.price);
        let description: string = createMealDescription(meal.description);

        message += `\*${meal.category}:\*\n`;
        message += `${description} für ${price}`;
    }

    message += `\n`;

    message += `\*Hauptbeilagen\*:\n${menu.sides}\n\n`;
    message += `\*Nebenbeilage\*:\n${menu.vegetables}`;

    return message;
}

// Escape all special characters
function escapeMessage(message: string): string {
    return message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
