import { Request, Response } from 'express';
import { Price, User } from './models';
import { redisClient, io } from './server';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { config } from './config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email,
    pass: config.emailPassword
  }
});

export const fetchPrices = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(config.coingeckoAPI, { params: { ids: 'bitcoin,ethereum', vs_currencies: 'usd' } });
    const prices = response.data;

    Object.keys(prices).forEach((symbol) => {
      const price = prices[symbol].usd;

      // Update the price in MongoDB
      const newPrice = new Price({ symbol, price });
      newPrice.save();

      // Update the price in Redis
      redisClient.set(symbol, price.toString());

      // Emit the price update to clients
      io.emit('priceUpdate', { symbol, price });

      // Check for alerts
      User.find({ symbol, alertPrice: { $gte: price } }, (err, users) => {
        if (err) throw err;
        users.forEach(user => {
          transporter.sendMail({
            from: config.email,
            to: user.email,
            subject: 'Price Alert',
            text: `The price of ${symbol} has reached your alert price of $${user.alertPrice}. Current price: $${price}`
          }, (err, info) => {
            if (err) throw err;
            console.log(`Alert sent to ${user.email}: ${info.response}`);
          });
        });
      });
    });

    res.status(200).json(prices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const { email, alertPrice, symbol } = req.body;
    const newUser = new User({ email, alertPrice, symbol });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add user' });
  }
};
