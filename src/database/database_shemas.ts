import {Schema, model} from 'mongoose';
import { IUser } from '../types/interfaces';

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
    allergens: {
      type: Boolean,
      default: false,
      required: true,
    },
    admin: {
      type: Boolean,
      default: false,
      required: true,
    },
  });
  
  export const User = model<IUser>('User', UserShema);