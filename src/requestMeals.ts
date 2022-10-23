import request from 'request';
import { Meal, Menue, allCanteens } from './global';

export let information: {[key: string]: Menue} = {};

export function requestMeals(): void {
    let date: Date = new Date();
    let today: string = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();

    for(let canteen of allCanteens) {
        request({uri: `https://openmensa.org/api/v2/canteens/${canteen.api_id}/days/${today}/meals`}, (error, response, body) => { 
            let json = JSON.parse(body);
            information[canteen.canteen_id] = createMenue(json);
        });
    }
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

