import { Router } from "express";
import authRouter from "./auth";
import userSettingRouter from "./homepage";
import rideRouter from "./rides";



const mainRoutes=Router();

mainRoutes.use('',authRouter)


mainRoutes.use('',userSettingRouter)

mainRoutes.use("",rideRouter)

export default mainRoutes;