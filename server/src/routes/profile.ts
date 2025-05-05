import { Router } from "express";
import profileController from "../controllers/profile"

const profileRouter = Router();

profileRouter.post("/view-rider-history",profileController.viewHistory)


export default profileRouter;



