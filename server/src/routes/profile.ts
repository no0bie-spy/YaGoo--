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


profileRouter.get('/riderProfile', profileController.viewRiderProfile);

export default profileRouter;  // Export the profileRouter to be used in other files
