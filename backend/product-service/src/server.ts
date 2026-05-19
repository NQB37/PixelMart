import express from 'express';
import { PORT } from './config/env';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('health', (req, res) => {
  res.send('ok');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
