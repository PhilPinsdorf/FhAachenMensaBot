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
    meals: Meal[];
    sides?: string;
    vegetables?: string; 
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
