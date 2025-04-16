import express from 'express';

import authController from '../controllers/auth';
import validate from '../middleware/validation';
import userValidation from '../validations/auth';


const authRouter = express.Router();

authRouter.post('/register',validate(userValidation.register),authController.register);
authRouter.post('/login',validate(userValidation.login),authController.login);
authRouter.post('/verifyOTP',validate(userValidation.otp),authController.verifyEmail);

  authRouter.post('/registerRider',validate(userValidation.registerRider),authController.registerRider);
  authRouter.post('/forgotPassword',validate(userValidation.forgotPassword),authController.sendOTP);



export default authRouter