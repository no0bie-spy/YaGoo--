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

// Authentication routes
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - fullname
 *               - password
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               fullname:
 *                 type: string
 *                 minLength: 3
 *               password:
 *                 type: string
 *                 minLength: 6
 *               phone:
 *                 type: string
 *                 pattern: "^[0-9]{10}$"
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Invalid input
 */
authRouter.post('/register', validate(userValidation.register), authController.register);

authRouter.post('/register', validate(userValidation.register), authController.register);
authRouter.post('/login', validate(userValidation.login), authController.login);
authRouter.post('/verifyOTP', validate(userValidation.otp), authController.verifyEmail);
authRouter.post('/set-new-password', authController.setNewPassword); // Only once

// OTP-related routes
authRouter.post('/sendOTP', validate(userValidation.forgotPassword), otpController.sendRegisterOtp);
authRouter.post('/forgotPassword', validate(userValidation.forgotPassword), authController.forgotPassword);

// Rider-specific routes
authRouter.post('/register-rider', riderUpload, authController.registerRider);

// Password-related routes
authRouter.post('/changePassword', validate(userValidation.changePassword), authController.changePassword);

// Logout route
authRouter.post('/logout', authController.logout);

export default authRouter;
