import { Router } from "express";
import authRouter from "./auth";
import userSettingRouter from "./homepage";
import getUserfromAuthToken from "../middleware/jwtfromUser";
import rideRouter from "./rides";



const mainRoutes=Router();

mainRoutes.use('/auth',authRouter)

mainRoutes.use('/profile',getUserfromAuthToken,userSettingRouter)

mainRoutes.use('/rides',getUserfromAuthToken,rideRouter)

export default mainRoutes;