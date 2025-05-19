import { Router } from "express";
import profileController from "../controllers/profile";
import validate from "../middleware/validation";
import userValidation from "../validations/auth";

const profileRouter = Router();  // This is where it's defined

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



export default profileRouter;  