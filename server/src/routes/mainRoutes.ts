import { Router } from "express";
import authRouter from "./auth";
import userSettingRouter from "./homepage";



const mainRoutes=Router();

mainRoutes.use('',authRouter)


mainRoutes.use('',userSettingRouter)



export default mainRoutes;