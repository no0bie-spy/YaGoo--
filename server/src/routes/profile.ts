import { Router } from "express";
import profileController from "../controllers/profile";
import validate from "../middleware/validation";
import userValidation from "../validations/auth";
import profileValidation from "../validations/profile";

const profileRouter = Router();

profileRouter.get('/history', profileController.viewHistory);

profileRouter.get('/details', profileController.userDetails);

profileRouter.put(
  '/edit',
  validate(userValidation.editProfileDetails),
  profileController.editProfileDetails
);

profileRouter.post('/switch-role',profileController.switchRole)
profileRouter.get('/riderProfile', profileController.viewRiderProfile);

profileRouter.delete('/deleteProfile', profileController.deleteUser);

profileRouter.put('/changePassword', validate(profileValidation.changePassword),profileController.changePassword)



export default profileRouter;  
