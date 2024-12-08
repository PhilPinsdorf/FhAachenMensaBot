import { IMeal, IMenu } from "../types/interfaces";

// ToDo: Make Typesafe
export function create_menue(meals: any[]): IMenu {
    let menu: IMenu = { 
        meals: [],
        open: true,
    };
    
    meals.forEach(raw_meal => {
        switch (raw_meal.category) {
            case 'Hauptbeilagen':
                menu.sides = raw_meal.name.join(' oder ');
                menu.sides_notes = raw_meal.notes;
                break;

            case 'Nebenbeilage':
                menu.vegetables = raw_meal.name.join(' oder ');
                menu.vegetables_notes = raw_meal.notes;
                break;
            
            default:
                menu.meals.push({
                    description: create_meal_description(raw_meal.name),
                    category: raw_meal.category,
                    price: raw_meal.prices ? raw_meal.prices.replaceAll(' ', '') : "-,--€",
                    notes: raw_meal.notes,
                } as IMeal);
            break;
        }
    });

    return menu;
}

// Create a more readable Menue: abc | def | ghi  =>  abc, def dazu ghi
function create_meal_description(meal_components: string[]): string {
    let text: string = "";
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