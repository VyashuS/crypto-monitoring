import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { RedisClient } from 'redis';
import { config } from './config';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
const redisClient = new RedisClient({ url: config.redisURL });

app.use(express.json());

mongoose.connect(config.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.use('/api', require('./routes'));

httpServer.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

export { io, redisClient };
