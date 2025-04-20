import express from 'express';
import validate from '../middleware/validation';
import rideValidation from '../validations/rides';

const rideRouter = express.Router();

rideRouter.post('/set-location', validate(rideValidation.setLocation));

rideRouter.post('/create-ride', validate(rideValidation.createRide));

rideRouter.post('/bid-ride', validate(rideValidation.bidRide));

rideRouter.post('/accept-bid', validate(rideValidation.acceptBid));

export default rideRouter;
