import { todays_menus, tomorrows_menus } from "./request_menus";
import { all_canteens, greetings } from "./definitions"; 
import { IMenu } from "./interfaces";
import moment from "moment"

// Object with all completely parsed Messages
export let final_messages: Record<string, Record<string, string>> = {
    today: {},
    today_allergens: {},
    tomorrow: {},
    tomorrow_allergens: {},
};

// Parse all Messages for all canteens
export function parseMessages() {
    for(let canteen of all_canteens) {
        final_messages.today[canteen.canteen_id] = escape_message(
            build_menu_message(todays_menus[canteen.canteen_id], canteen.name, "Heute")
        );

        final_messages.today_allergens[canteen.canteen_id] = escape_message(
            build_allergens_message(todays_menus[canteen.canteen_id], canteen.name, "Heute")
        );

        final_messages.tomorrow[canteen.canteen_id] = escape_message(
            build_menu_message(tomorrows_menus[canteen.canteen_id], canteen.name, getDayTitle())
        );

        final_messages.tomorrow_allergens[canteen.canteen_id] = escape_message(
            build_allergens_message(tomorrows_menus[canteen.canteen_id], canteen.name, getDayTitle())
        );
    }
}

// Escape all special characters
export function escape_message(message: string): string {
    return message.replace(/[.\-_+!?^${}()|[\]\\]/g, '\\$&');
}

export function random_greeting(): string {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  }

function build_menu_message(menu: IMenu, canteen_name: string, day_title: string): string{
    let message: string = day_title;

    if(menu.open) {
        message += `\* gibt es in der ${canteen_name}:\*\n\n\n`;

        for (let meal of menu.meals) {
            message += `\*${meal.category}${emoji(meal.category, meal.notes, [])}:\*\n`;
            message += `${meal.description} für ${meal.price}\n\n`;
        }

        message += `\n`;

        message += `\*Hauptbeilagen\*${emoji("", [], menu.sides)}:\n${menu.sides}\n\n`;
        message += `\*Nebenbeilage\*:\n${menu.vegetables}`;
    } else {
        message += ` hat die ${canteen_name} \*geschlossen\*.`;
    }

    return message;
}

function build_allergens_message(menu: IMenu, canteen_name: string, day_title: string): string{
    let message: string = day_title;

    if(menu.open) {
        message += `\* gibt es in der ${canteen_name}:\*\n\n`;

        for (let meal of menu.meals) {
            message += `\n\*${meal.category}${emoji(meal.category, meal.notes, [])}:\*\n`;
            message += `${meal.description} für ${meal.price}\n`;
            message += build_allergens_annotation(meal.notes, true);
        }

        message += `\n\n`;

        message += `\*Hauptbeilagen\*${emoji("", [], menu.sides)}:\n${menu.sides}\n`;
        message += build_allergens_annotation(menu.sides_notes, true) + `\n`;

        message += `\*Nebenbeilage\*:\n${menu.vegetables}\n`;
        message += build_allergens_annotation(menu.vegetables_notes, false);
    } else {
        message += ` hat die ${canteen_name} \*geschlossen\*.`;
    }

    return message;
}

function build_allergens_annotation(notes: string[], line_break: boolean): string {
    let text: string = '';

    let cloned_notes = [...notes]
    cloned_notes = cloned_notes.filter(item => item != 'OLV');
    cloned_notes = cloned_notes.filter(item => item != 'vegan');
    cloned_notes = cloned_notes.filter(item => item != 'Preis ohne Pfand');

    if(cloned_notes.length){
        text += '('+ cloned_notes.join(', ') + ')';
    }

    if(line_break) {
        text += `\n`;
    }

    return text;
}

function getDayTitle(): string {
    moment.locale('de');
    return moment().add(1, 'days').format("dddd");
}

function emoji(category: string, notes: string[], sides: string[]): string {
    if (sides.includes('Pommes Frites')) {
        return ' 🍟🍟🍟';
    }

    if (notes.includes('OLV')) {
        return ' 🌱';
    }

    if (notes.includes('vegan')) {
        return ' 🌱 (vegan)';
    }

    if (notes.includes('Fische')) {
        return ' 🐟';
    }

    if (category.includes('Klassiker')) {
        return ' 🐮';
    }

    if (category.includes('Wok')) {
        return ' 🍜';
    }

    if (category.includes('Pasta')) {
        return ' 🍝';
    }

    if (category.includes('Burger')) {
        return ' 🍔';
    }

    return '';
}