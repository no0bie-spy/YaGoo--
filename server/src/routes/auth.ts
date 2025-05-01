import express from 'express';
import authController from '../controllers/auth';
import validate from '../middleware/validation';
import userValidation from '../validations/auth';
import upload from '../middleware/multerConfig';
import otpController from '../controllers/otp';


const authRouter = express.Router();

const riderUpload = upload.fields([
  { name: 'licensePhoto', maxCount: 1 },
  { name: 'citizenshipPhoto', maxCount: 1 },
  { name: 'vehiclePhoto', maxCount: 1 },
  { name: 'vehicleNumberPlatePhoto', maxCount: 1 },
  { name: 'vehicleBlueBookPhoto', maxCount: 1 },
]);


authRouter.post('/register',validate(userValidation.register),authController.register);
authRouter.post('/login',validate(userValidation.login),authController.login);
authRouter.post('/verifyOTP',validate(userValidation.otp),authController.verifyEmail);
authRouter.post('/sendOTP',validate(userValidation.forgotPassword),otpController.sendRegisterOtp);

authRouter.post('/registerRider',riderUpload,authController.registerRider);
authRouter.post('/forgotPassword',validate(userValidation.forgotPassword),authController.forgotPassword);
authRouter.post('/changePassword',validate(userValidation.changePassword),authController.changePassword);
authRouter.post('/logout',authController.logout);



export default authRouter