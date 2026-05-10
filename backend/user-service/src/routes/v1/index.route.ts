import { Router } from 'express';
import { authRouter } from './auth.routes.js';

const route = Router();

route.use('/auth', authRouter);

export const APIs_V1 = route;
