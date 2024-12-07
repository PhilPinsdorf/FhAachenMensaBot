export interface ICanteen { 
    name: string; 
    identifier: string; 
    web_suffix: string;
    canteen_id: number;
} 

export interface IMeal { 
    description: string; 
    category: string; 
    price: string;
    notes: string[];
} 

export interface IMenu {
    meals?: IMeal[];
    sides?: string[];
    sides_notes?: string[];
    vegetables?: string[]; 
    vegetables_notes?: string[];
    open?: boolean;
}

export interface IUser {
  chat_id: number;
  name: string;
  joined: Date; 
  canteen_id: number;
  time: string;
  allergens: boolean;
  admin: boolean;
}

export interface ILegend {
    [key: string]: string;
}

export interface IParserConfig {
    [key: string]: string;
}