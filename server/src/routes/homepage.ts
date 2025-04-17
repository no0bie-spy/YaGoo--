import express, { Router } from 'express';
import validate from '../middleware/validation';

import getUserfromAuthToken from '../middleware/jwtfromUser';
import homepageController from '../controllers/homepage';

const userSettingRouter = Router();

userSettingRouter.get('/userdetails', getUserfromAuthToken, homepageController.userDetails )

export default userSettingRouter