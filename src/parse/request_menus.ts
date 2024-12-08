import moment from "moment"
import { all_canteens } from '../types/definitions'; 
import { IMenu } from '../types/interfaces';
import { create_parser, Parser } from './parse_canteens';
import { create_menue } from './parse_menus';

const parser: Parser = create_parser();
export let todays_menus: {[key: string]: IMenu};
export let tomorrows_menus: {[key: string]: IMenu};

export async function request_relevant_menus(): Promise<void> {
    const today = moment().format("DD-MM-YYYY");
    const tomorrow = moment().add(1, 'days').format("DD-MM-YYYY");

    todays_menus = await request_all_menus_on(today);
    tomorrows_menus = await request_all_menus_on(tomorrow);
}

async function request_all_menus_on(date: string): Promise<{ [key: string]: IMenu; }> {
    let canteen_menu: {[key: string]: IMenu} = {};

    for(const canteen of all_canteens) {
        const result = await parser.parse(canteen.identifier);
        if(date in result) {
            canteen_menu[canteen.canteen_id] = create_menue(result[date].meals);
            console.log(`[${date}] ${canteen.name}/${canteen.canteen_id}: Parsed.`);
        } else {
            canteen_menu[canteen.canteen_id] = { open: false };
            console.log(`[${date}] ${canteen.name}/${canteen.canteen_id}: Closed.`);
        }
    }

    return canteen_menu;
}