import {Schema, model} from 'mongoose';

export interface Canteen { 
    name: string; 
    api_id: number; 
    canteen_id: number;
} 

export interface Meal { 
    description: string; 
    category: string; 
    price: number;
} 

export interface Menue {
    meals?: Meal[];
    sides?: string;
    vegetables?: string; 
    open?: boolean;

}

export let allCanteens: Canteen[] = [ 
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
];

const userShema = new Schema({
  chat_id: { 
    type: String,
    required: true
  },
  name: {
    type: String
  },
  joined: {
    type: Date,
    default: Date.now
  },
  canteen_id : {
    type: Number,
    default: 5,
    required: true
  }, 
  time: {
    type: String,
    default: "09:30",
    required: true
  }
});

export const User = model('User', userShema);
