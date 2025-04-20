import { Router } from "express";
import authRouter from "./auth";
import userSettingRouter from "./homepage";
import getUserfromAuthToken from "../middleware/jwtfromUser";
import rideRouter from "./rides";



const mainRoutes=Router();

mainRoutes.use('',authRouter)


mainRoutes.use('',getUserfromAuthToken,userSettingRouter)

mainRoutes.use("",getUserfromAuthToken,rideRouter)

export default mainRoutes;