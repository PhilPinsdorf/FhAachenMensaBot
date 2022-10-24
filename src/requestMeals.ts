import * as request from 'request';
import * as moment from 'moment';
import { Meal, Menue, allCanteens } from './global';

let mealsToday: {[key: string]: Menue} = {};
let mealsTomorrow: {[key: string]: Menue} = {};

test();

async function test() {
    await loadNewMeals();
}

export async function loadNewMeals(): Promise<void> {
    const today = moment().format("YYYY-MM-DD");
    let nextBusinessDay: number = 1;

    if(moment().day() == 5) {
        nextBusinessDay = 3;
    }

    const tomorrow = moment().add(nextBusinessDay, 'days').format("YYYY-MM-DD");

    mealsToday = await requestMeals(today);
    console.log(mealsToday);
    mealsTomorrow = await requestMeals(tomorrow);

    return Promise.resolve();
}

// 
async function requestMeals(date: string): Promise<{ [key: string]: Menue; }> {
    let information: {[key: string]: Menue} = {};

    for await (let canteen of allCanteens) {
        request({uri: `https://openmensa.org/api/v2/canteens/${canteen.api_id}/days/${date}/meals`}, (error, response, body) => { 
            let json = JSON.parse(body);
            information[canteen.canteen_id] = createMenue(json);
        });
    }

    return Promise.resolve(information);
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

