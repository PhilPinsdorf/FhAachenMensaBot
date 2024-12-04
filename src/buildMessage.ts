import { todaysMeals, tomorrowsMeals } from "./requestMeals";
import { allCanteens, Menue } from "./global";
import * as moment from 'moment';


// Object with all completely parsed Messages
export let finalMessages: Record<string, Record<string, string>> = {
    today: {},
    tomorrow: {}
};

// Parse all Messages for all canteens
export function parseMessages() {
    for(let canteen of allCanteens) {
        finalMessages.today[canteen.canteen_id] = escapeMessage(
            parseToMessage(todaysMeals, canteen.name, getDayTitle())
        );

        finalMessages.tomorrow[canteen.canteen_id] = escapeMessage(
            parseToMessage(tomorrowsMeals, canteen.name, "Heute")
        );
    }
}

// Escape all special characters
export function escapeMessage(message: string): string {
    return message.replace(/[.\-_+?^${}()|[\]\\]/g, '\\$&');
}

// Create Message from parsed Information
function parseToMessage(menu: Menue, canteen_name: string, day_title: string): string{
    let message: string = day_title;

    if(menu.open) {
        message += `\* gibt es in der ${canteen_name}:\* \n\n\n`;

        for (let meal of menu.meals) {
            let priceString: string = Number(meal.price).toFixed(2).replace('.', ',') + ' €';
            let description: string = createMealDescription(meal.description);

            message += `\*${meal.category}:\*\n`;
            message += `${description} für ${priceString}\n\n\n`;
        }

        message += `\*Hauptbeilagen\*:\n${menu.sides}\n\n`;
        message += `\*Nebenbeilage\*:\n${menu.vegetables}`;
    } else {
        message += ` hat die ${canteen_name} \*geschlossen\*.`;
    }

    return message;
}

// Create a more readable Menue: abc | def | ghi  =>  abc, def dazu ghi
function createMealDescription(description: string): string {
    let text: string = "";
    let meal_components: string[] = description.split('|');
    meal_components.map((element) => { element.trim() });

    for (let i = 0; i < meal_components.length; i++) {
        text += meal_components[i];
    
        if (i < meal_components.length - 2) {
            text += ", ";
        } else if (i === meal_components.length - 2) {
            text += " dazu "; 
        }
    }

    return text;
}

function getDayTitle(): string {
    moment.locale('de');
    return moment().add(1, 'days').format("dddd");
}
