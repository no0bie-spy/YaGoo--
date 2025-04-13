import express from 'express';

import authController from '../controllers/auth';
import validate from '../middleware/validation';
import userValidation from '../validations/auth';

const authRouter = express.Router();

authRouter.post('/register',validate(userValidation.register),authController.register);

export default authRouter