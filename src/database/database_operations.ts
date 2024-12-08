import { IUser } from '../types/interfaces';
import { User } from './database_shemas';

export async function user_exists(chat_id: number): Promise<IUser> {
    try {
        const user = await User.findOne({ chat_id: chat_id });
        return user; 
    } catch (err) {
        console.error(`[Database] Error in user_exists:\n${err}`);
    }
}

export async function all_users(): Promise<IUser[]> {
    try {
        const users = await User.find({ });
        return users; 
    } catch (err) {
        console.error(`[Database] Error in all_users:\n${err}`);
    }
}

export async function add_user(chat_id: number, name: string): Promise<IUser> {
    try {
        const possible_user = await user_exists(chat_id);

        if(!possible_user) {
            const user = await new User({ chat_id: chat_id, name: name} ).save();
            console.log(`${name}/${chat_id}: User Registered.`);
            return user;
        }

        console.warn(`${name}/${chat_id}: Tried to register again.`);
    } catch (err) {
        console.error(`[Database] Error in add_user:\n${err}`);
    }
}

export async function remove_user(chat_id: number, name: string, blocked: boolean): Promise<IUser> {
    try {
        const user = await User.findOneAndDelete({ chat_id: chat_id });
        if (user) {
            console.log(`${name}/${chat_id}: Deleted Account.${blocked ? " (Blocked)" : ""}`);
            return user;
        }

        console.warn(`${name}/${chat_id}: Failed to delete Account.`);
    } catch (err) {
        console.log(`[Database] Error in remove_user:\n${err}`);
    }
}

export async function update_name(chat_id: number, new_name: string): Promise<IUser> {
    try {
        const user = await User.findOneAndUpdate({ chat_id: chat_id }, { name: new_name }, { new: true });

        if (user) {
            console.log(`${new_name}/${chat_id}: Updated Name.`);
            return user; 
        } 
        
        console.warn(`${new_name}/${chat_id}: Failed to update Name.`);
    } catch (err) {
        console.error(`[Database] Error in update_name:\n${err}`);
    }
}

export async function update_canteen(chat_id: number, name: string, new_canteen_id: number): Promise<IUser> {
    try {
        const user = await User.findOneAndUpdate({ chat_id: chat_id }, { canteen_id: new_canteen_id }, { new: true });

        if (user) {
            console.log(`${name}/${chat_id}: Updated canteen to ${new_canteen_id}.`);
            return user; 
        } 
        
        console.warn(`${name}/${chat_id}: Failed to update canteen.`);
    } catch (err) {
        console.error(`[Database] Error in update_canteen:\n${err}`);
    }
}

export async function update_time(chat_id: number, name: string, new_time: string): Promise<IUser> {
    try {
        const user = await User.findOneAndUpdate({ chat_id: chat_id }, { time: new_time }, { new: true });

        if (user) {
            console.log(`${name}/${chat_id}: Updated time to ${new_time}.`);
            return user; 
        } 
        
        console.warn(`${name}/${chat_id}: Failed to update time.`);
    } catch (err) {
        console.error(`[Database] Error in update_time:\n${err}`);
    }
}

export async function update_allergens(chat_id: number, name: string): Promise<IUser> {
    try {
        const user = await User.findOneAndUpdate({ chat_id: chat_id }, [ { "$set": { allergens: { "$not": "$allergens" } } } ], { new: true });

        if (user) {
            console.log(`${name}/${chat_id}: Updated allergens to ${user.allergens}.`);
            return user; 
        } 
        
        console.warn(`${name}/${chat_id}: Failed to update allergens.`);
    } catch (err) {
        console.error(`[Database] Error in update_allergens:\n${err}`);
    }
}

export async function check_users_with_time(time: string): Promise<IUser[]> {
    try {
        const users = await User.find({time: time});
        return users;
    } catch (err) {
        console.error(`[Database] Error in check_users_with_time:\n${err}`);
    }
}