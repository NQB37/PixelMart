import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { FRONTEND_URL, PORT } from './config/env.js';
import { errorHandler } from './middlewares/errorHandle.middleware.js';
import { corsOption } from './config/corsOption.js';
import { APIs_V1 } from './routes/v1/index.route.js';

const app = express();

app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('User service is running');
});

app.use('/api/v1', APIs_V1);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
