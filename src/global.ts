import {Schema, model} from 'mongoose';

export interface ICanteen { 
    name: string; 
    api_id: number; 
    canteen_id: number;
} 

export interface IMeal { 
    description: string; 
    category: string; 
    price: number;
} 

export interface IMenue {
    meals?: IMeal[];
    sides?: string;
    vegetables?: string; 
    open?: boolean;
}

export let all_canteens: ICanteen[] = [ 
  {
    name: "Mensa Academica",
    api_id: 187,
    canteen_id: 1,
  },
  {
    name: "Mensa Vita",
    api_id: 96,
    canteen_id: 2,
  },
  {
    name: "Mensa Ahorn",
    api_id: 95,
    canteen_id: 3,
  },
  {
    name: "Mensa Bistro Tempelgraben",
    api_id: 94,
    canteen_id: 4,
  },
  {
    name: "Mensa Eupener Straße",
    api_id: 98,
    canteen_id: 5,
  },
  {
    name: "Mensa Bayernallee",
    api_id: 97,
    canteen_id: 6,
  },
  {
    name: "Mensa Südpark",
    api_id: 1000,
    canteen_id: 7,
  },
];

export interface IUser {
  chat_id: number;
  name: string;
  joined: Date; 
  canteen_id: number;
  time: string;
  admin: boolean;
}

const UserShema = new Schema({
  chat_id: { 
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  joined: {
    type: Date,
    default: Date.now,
    required: true,
  },
  canteen_id : {
    type: Number,
    default: 5,
    required: true,
  }, 
  time: {
    type: String,
    default: "09:30",
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
    required: true,
  },
});

export const User = model<IUser>('User', UserShema);
