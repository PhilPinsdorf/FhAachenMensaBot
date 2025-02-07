import { todays_menus, tomorrows_menus } from "../parse/request_menus";
import { all_canteens, all_canteen_groups, greetings } from "../types/definitions"; 
import { IMenu } from "../types/interfaces";
import moment from "moment"
import { TypeExpressionOperatorReturningBoolean } from "mongoose";

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
            build_menu_message(todays_menus[canteen.canteen_id], canteen.name, "Heute", false)
        );

        final_messages.today_allergens[canteen.canteen_id] = escape_message(
            build_menu_message(todays_menus[canteen.canteen_id], canteen.name, "Heute", true)
        );

        final_messages.tomorrow[canteen.canteen_id] = escape_message(
            build_menu_message(tomorrows_menus[canteen.canteen_id], canteen.name, getDayTitle(), false)
        );

        final_messages.tomorrow_allergens[canteen.canteen_id] = escape_message(
            build_menu_message(tomorrows_menus[canteen.canteen_id], canteen.name, getDayTitle(), true)
        );
    }
    for(let canteen_group of all_canteen_groups) {
        let today: string = "";
        let today_allergens: string = "";
        let tomorrow: string = "";
        let tomorrow_allergens: string = "";
        for (let canteen of canteen_group.canteens) {
            today += final_messages.today[canteen.canteen_id];
            today_allergens += final_messages.today_allergens[canteen.canteen_id];
            tomorrow += final_messages.tomorrow[canteen.canteen_id];
            tomorrow_allergens += final_messages.tomorrow_allergens[canteen.canteen_id];
        }
        final_messages.today[canteen_group.canteen_group_id] = today;
        final_messages.today_allergens[canteen_group.canteen_group_id] = today_allergens;
        final_messages.tomorrow[canteen_group.canteen_group_id] = tomorrow;
        final_messages.tomorrow_allergens[canteen_group.canteen_group_id] = tomorrow_allergens;
    }
}

// Escape all special characters
export function escape_message(message: string): string {
    return message.replace(/[.\-_+!?^${}()|[\]\\]/g, '\\$&');
}

export function random_greeting(): string {
    const randomIndex = Math.round(Math.random() * (greetings.length + 1));
    if (randomIndex !== 0) return greetings[randomIndex - 1];

    // Last Moin only possible in theory because the number is floored,
    // so 3 is effectively 2 because 3 are so incredibly rare.
    // This is intentional for a "jackpot" effect.
    const maxMoins = 5;
    
    // Make the moins progressively more rare.
    const moinCount = 1 + Math.floor(Math.random() ** 2 * (maxMoins - 1));

    return "Moin ".repeat(moinCount).trimEnd();
}

function build_menu_message(menu: IMenu, canteen_name: string, day_title: string, allergens: boolean): string{
    let message: string = day_title;

    if(menu.open) {
        message += `\* gibt es in der ${canteen_name}:\*\n\n\n`;

        for (let meal of menu.meals) {
            message += `\*${meal.category}${emoji(meal.category, meal.notes, [])}:\*\n`;
            message += `${meal.description} für ${meal.price}\n`;
            if (allergens) {
                message += build_allergens_annotation(meal.notes, true);
            }
            message += `\n`
        }

        if (menu.sides) {
            message += `\n`;
            message += `\*Hauptbeilagen\*${emoji("", [], menu.sides)}:\n${menu.sides}\n`;
            if (allergens) {
                message += build_allergens_annotation(menu.sides_notes, true);
            }
            message += `\n`
        }

        if (menu.vegetables) {
            message += `\*Nebenbeilage\*:\n${menu.vegetables}\n`;
            if (allergens) {
                message += build_allergens_annotation(menu.vegetables_notes, false);   
            }
        }
    } else {
        message += ` hat die ${canteen_name} \*geschlossen\*.`;
    }

    return message;
}

function build_allergens_annotation(notes: string[], line_break: boolean): string {
    let text: string = '';

    if(notes) {
        let cloned_notes = [...notes]
        cloned_notes = cloned_notes.filter(item => item != 'OLV');
        cloned_notes = cloned_notes.filter(item => item != 'vegan');
        cloned_notes = cloned_notes.filter(item => item != 'Preis ohne Pfand');

        if(cloned_notes.length){
            text += '('+ cloned_notes.join(', ') + ')';
        }
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
    if (sides && sides.includes('Pommes Frites')) {
        return ' 🍟🍟🍟';
    }

    if (notes.includes('vegan')) {
        return ' 🌱 (vegan)';
    }

    if (notes.includes('OLV')) {
        return ' 🌱';
    }

    if (notes.includes('Fische')) {
        return ' 🐟';
    }

    if (category.includes('Pasta')) {
        return ' 🍝';
    }

    return '';
}
