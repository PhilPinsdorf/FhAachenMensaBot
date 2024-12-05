import * as moment from 'moment';
import { IMeal, IMenue, all_canteens } from './global';

export let todaysMeals: {[key: string]: IMenue};
export let tomorrowsMeals: {[key: string]: IMenue};

async function requestMeals(date: string): Promise<{ [key: string]: IMenue; }> {
    let information: {[key: string]: IMenue} = {};

    await Promise.all(all_canteens.map(async (canteen) => {
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

// ToDo: Make Typesafe
function createMenue(json): IMenue {
    let menue: IMenue = { 
        meals: [],
        open: true,
    };
    
    json.forEach(element => {
        switch (element.category) {
            case 'Hauptbeilagen':
                menue.sides = element.name;
                break;

            case 'Nebenbeilage':
                menue.vegetables = element.name;
                break;
            
            default:
                menue.meals.push({
                    description: element.name,
                    category: element.category,
                    price: element.prices.students,
                } as IMeal);
            break;
        }
    });

    return menue;
}

export async function loadNewMeals(): Promise<void> {
    const today = moment().format("YYYY-MM-DD");
    const tomorrow = moment().add(1, 'days').format("YYYY-MM-DD");

    todaysMeals = await requestMeals(today);
    tomorrowsMeals = await requestMeals(tomorrow);
}