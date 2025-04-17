import express from 'express';
import authController from '../controllers/auth';
import validate from '../middleware/validation';
import userValidation from '../validations/auth';
import upload from '../middleware/multerConfig';


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
authRouter.post('/sendOTP',validate(userValidation.forgotPassword),authController.sendOTP);

authRouter.post('/registerRider', riderUpload, (req, res, next) => {
  // Attach file names to body so they can be validated
  const files = req.files as Record<string, Express.Multer.File[]>;
  if (files) {
    for (const field in files) {
      req.body[field] = files[field][0]?.filename || '';
    }
  }
  // Call the actual validation middleware
  validate(userValidation.registerRider)(req, res, next);
}, authController.registerRider);
authRouter.post('/forgotPassword',validate(userValidation.forgotPassword),authController.forgotPassword);
  authRouter.post('/changePassword',validate(userValidation.changePassword),authController.changePassword);



export default authRouter