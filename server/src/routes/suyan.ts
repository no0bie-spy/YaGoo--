import suyanController from "../controllers/suyan";
import express from 'express';

const suyanRouter = express.Router();

suyanRouter.get('/view-otp', suyanController.viewRiderOtp); // ride completes

export default suyanRouter;