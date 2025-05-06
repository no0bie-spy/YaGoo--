import { Router } from "express";
import profileController from "../controllers/profile"

const profileRouter = Router();

profileRouter.get("/view-rider-history",profileController.viewHistory)
profileRouter.get("/view-rider-details",profileController.viewRiderProfile)


export default profileRouter;



