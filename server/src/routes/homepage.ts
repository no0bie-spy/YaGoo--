import express, { Router } from 'express';
import validate from '../middleware/validation';

import getUserfromAuthToken from '../middleware/jwtfromUser';
import homepageController from '../controllers/homepage';
import userValidation from '../validations/auth';

const userSettingRouter = Router();

userSettingRouter.get('/userdetails',  homepageController.userDetails )
userSettingRouter.put('/editProfileDetails', validate(userValidation.editProfileDetails), homepageController.editProfileDetails )

export default userSettingRouter