import { Schema, model, Document } from 'mongoose';

interface IPrice extends Document {
  symbol: string;
  price: number;
  timestamp: Date;
}

const priceSchema = new Schema({
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Price = model<IPrice>('Price', priceSchema);

interface IUser extends Document {
  email: string;
  alertPrice: number;
  symbol: string;
}

const userSchema = new Schema({
  email: { type: String, required: true },
  alertPrice: { type: Number, required: true },
  symbol: { type: String, required: true }
});

const User = model<IUser>('User', userSchema);

export { Price, User };
