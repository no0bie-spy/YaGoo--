import { Router } from "express";
import authRouter from "./auth";



const mainRoutes=Router();

mainRoutes.use('',authRouter)



export default mainRoutes;