import { Router } from "express";
import authRouter from "./auth";
import userSettingRouter from "./homepage";
import getUserfromAuthToken from "../middleware/jwtfromUser";
import rideRouter from "./rides";
import profileRouter from "./profile"


const mainRoutes=Router();

mainRoutes.use('/auth',authRouter)

mainRoutes.use('/profile',getUserfromAuthToken,userSettingRouter)

mainRoutes.use('/rides',getUserfromAuthToken,rideRouter)

mainRoutes.use('/profile',getUserfromAuthToken,profileRouter)

// mainRoutes.use('/suyan',getUserfromAuthToken,suyanRouter)

export default mainRoutes;