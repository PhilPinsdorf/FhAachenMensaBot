import * as moment from 'moment';
import { Meal, Menue, allCanteens } from './global';

export let mealsToday: {[key: string]: Menue} = {};
export let mealsTomorrow: {[key: string]: Menue} = {};

async function requestMeals(date: string): Promise<{ [key: string]: Menue; }> {
    let information: {[key: string]: Menue} = {};

    await Promise.all(allCanteens.map(async (canteen) => {
        try {
            const res = await fetch(`https://openmensa.org/api/v2/canteens/${canteen.api_id}/days/${date}/meals`);
            const json = await res.json();
            information[canteen.canteen_id] = createMenue(json);
            console.log(`The menu for the canteen '${canteen.name}' was parsed. Date: ${date}.`);
        } catch (error) {
            information[canteen.canteen_id] = { open: false };
            console.log(`The canteen '${canteen.name}' is closed. Date: ${date}.`);
        }
    }));

    return information;
}

function createMenue(json): Menue {
    let menue: Menue = { meals: [] };

    menue.open = true;
    
    json.forEach(element => {
        if(element.category == 'Hauptbeilagen') {
            menue.sides = element.name;
            return;
        }

        if(element.category == 'Nebenbeilage') {
            menue.vegetables = element.name;
            return;
        }

        menue.meals.push({
            description: element.name,
            category: element.category,
            price: element.prices.students,
        } as Meal);
    });

    return menue;
}

export async function loadNewMeals(): Promise<void> {
    const today = moment().format("YYYY-MM-DD");
    const tomorrow = moment().add(1, 'days').format("YYYY-MM-DD");

    mealsToday = await requestMeals(today);
    mealsTomorrow = await requestMeals(tomorrow);
}