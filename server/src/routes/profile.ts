import { Router } from "express";
import profileController from "../controllers/profile"
import validate from "../middleware/validation";
import userValidation from "../validations/auth";


const profileRouter = Router();
/**
 * GET /profile/history
 * Retrieve the ride history of the logged-in user (customer or rider).
 */
profileRouter.get('/history', profileController.viewHistory);

/**
 * GET /profile/details
 * Fetch the profile information of the currently logged-in user.
 */
profileRouter.get('/details', profileController.userDetails);

/**
 * PUT /profile/edit
 * Update the logged-in user's profile information after validation.
 */
profileRouter.put(
  '/edit',
  validate(userValidation.editProfileDetails),
  profileController.editProfileDetails
);

export default profileRouter;



