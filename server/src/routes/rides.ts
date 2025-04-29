import express from 'express';
import validate from '../middleware/validation';
import rideValidation from '../validations/rides';
import rideController from '../controllers/rides';

const rideRouter = express.Router();

rideRouter.post('/create', validate(rideValidation.findRide), rideController.createRideRequest);
rideRouter.post('/bid', validate(rideValidation.placeBid), rideController.submitBid);
rideRouter.post('/rider-request', validate(rideValidation.requestRideByRider), rideController.requestRideAsRider)
rideRouter.get('/requests',  rideController.getAllRequestedRides);
rideRouter.get('/available-riders',  rideController.getAvailableRiders);
rideRouter.get('/verify-ride-otp',rideController.verifyRideOtp);
rideRouter.post('/accept',rideController.acceptRideRequestByCustomer);
rideRouter.delete('/reject-rider',rideController.rejectRider);
rideRouter.post('/complete-ride',rideController.completedRide)
rideRouter.post('/submit-ride-review',rideController.submitRideReview)

export default rideRouter;
