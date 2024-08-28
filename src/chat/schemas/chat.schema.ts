import { Schema, Document } from 'mongoose';

export const ChatSchema = new Schema({
  userId: { type: String, required: true },
  messages: { type: [String], default: [] },
}, { timestamps: true });

export interface Chat extends Document {
  userId: string;
  messages: string[];
}