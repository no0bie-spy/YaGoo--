import express from 'express';
import validate from '../middleware/validation';
import rideValidation from '../validations/rides';
import rideController from '../controllers/rides';


const rideRouter = express.Router();

rideRouter.post('/find-ride', validate(rideValidation.findRide),rideController.findRide);
rideRouter.post('/place-bid', validate(rideValidation.placeBid), rideController.placeBid);

// rideRouter.post('/bid-ride', validate(rideValidation.bidRide));

// rideRouter.post('/accept-bid', validate(rideValidation.acceptBid));

export default rideRouter;
