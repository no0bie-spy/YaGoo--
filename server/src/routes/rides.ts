import express from 'express';
import validate from '../middleware/validation';
import rideValidation from '../validations/rides';
import rideController from '../controllers/rides';

const rideRouter = express.Router();

rideRouter.post('/find-ride', validate(rideValidation.findRide), rideController.findRide);
rideRouter.post('/place-bid', validate(rideValidation.placeBid), rideController.placeBid);
rideRouter.post('/rider-request', validate(rideValidation.requestRideByRider), rideController.requestRideByRider)
rideRouter.get('/find-ride-by-rider',  rideController.findRideByRider);
rideRouter.get('/findRideByRider',  rideController.findRideByRider);


rideRouter.post('/customer-accept-rider',rideController.customerAcceptRider)
export default rideRouter;
