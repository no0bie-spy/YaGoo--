import { Router } from "express";
import profileController from "../controllers/profile"

const profileRouter = Router();

profileRouter.get("/view-rider-history",profileController.viewHistory)


export default profileRouter;



