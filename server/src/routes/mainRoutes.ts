import { Router } from "express";
import authRouter from "./auth"; 
import getUserfromAuthToken from "../middleware/jwtfromUser";
import rideRouter from "./rides"; 
import profileRouter from "./profile"; 

const mainRoutes = Router();

// Authentication Routes
// These routes do not require user authentication
mainRoutes.use('/auth', authRouter);

// Rides Routes
// These routes require user authentication, protected by `getUserfromAuthToken` middleware
mainRoutes.use('/rides', getUserfromAuthToken, rideRouter);

// Profile Routes
// These routes also require user authentication, protected by `getUserfromAuthToken` middleware
mainRoutes.use('/profile', getUserfromAuthToken, profileRouter);

export default mainRoutes;
