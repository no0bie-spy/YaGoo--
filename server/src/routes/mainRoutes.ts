import { Router } from "express";
import authRouter from "./auth";
import getUserfromAuthToken from "../middleware/jwtfromUser";
import rideRouter from "./rides";

import profileRouter from "./profile"


const mainRoutes=Router();

mainRoutes.use('/auth',authRouter)

mainRoutes.use('/rides',getUserfromAuthToken,rideRouter)

mainRoutes.use('/profile',getUserfromAuthToken,profileRouter)


export default mainRoutes;