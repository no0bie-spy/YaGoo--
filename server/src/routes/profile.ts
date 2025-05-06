import { Router } from "express";
import profileController from "../controllers/profile"

const profileRouter = Router();

profileRouter.get("/view-history",profileController.viewHistory)


export default profileRouter;



