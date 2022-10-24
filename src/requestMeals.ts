import * as request from 'request';
import * as moment from 'moment';
import { Meal, Menue, allCanteens } from './global';

export let mealsToday: {[key: string]: Menue} = {};
export let mealsTomorrow: {[key: string]: Menue} = {};

export async function loadNewMeals(): Promise<void> {
    const today = moment().format("YYYY-MM-DD");
    let nextBusinessDay: number = 1;

    if(moment().day() == 5) {
        nextBusinessDay = 3;
    }

    const tomorrow = moment().add(nextBusinessDay, 'days').format("YYYY-MM-DD");

    mealsToday = await requestMeals(today);
    mealsTomorrow = await requestMeals(tomorrow);

    return;
}

async function requestMeals(date: string): Promise<{ [key: string]: Menue; }> {
    let information: {[key: string]: Menue} = {};
    let promiseArray: Promise<void>[] = [];

    for await (let canteen of allCanteens) {
        promiseArray.push(new Promise((resolve, reject) => {
            request({uri: `https://openmensa.org/api/v2/canteens/${canteen.api_id}/days/${date}/meals`}, (error, response, body) => { 
                if (error) reject(error);

                let json = JSON.parse(body);
                information[canteen.canteen_id] = createMenue(json);

                resolve();
            });
        }));
    }

    await Promise.all(promiseArray);

    return information;
}

function createMenue(json): Menue {
    let menue: Menue = {meals: []};

    for(let element of json) {
        switch (element.category) {
            case 'Hauptbeilagen': 
                menue.sides = element.name;
                break;
            
            case 'Nebenbeilage':
                menue.vegetables = element.name;
                break;

            default:
                let meal: Meal = {
                    description: element.name,
                    category: element.category,
                    price: element.prices.students,
                };

                menue.meals.push(meal);
                break;   
        }
    }

    return menue;
}
