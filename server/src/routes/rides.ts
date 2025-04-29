import express from 'express';
import validate from '../middleware/validation';
import rideValidation from '../validations/rides';
import rideController from '../controllers/rides';

const rideRouter = express.Router();

rideRouter.post('/create', validate(rideValidation.findRide), rideController.createRideRequest);//successfully create ride by customer
rideRouter.post('/bid', validate(rideValidation.placeBid), rideController.submitBid);//customer place bids and send
rideRouter.delete('/cancel',rideController.cancelRide)
rideRouter.get('/requests',  rideController.getAllRequestedRides);//rider gets all the ride requests from customer
rideRouter.post('/rider-request', validate(rideValidation.requestRideByRider), rideController.requestRideAsRider)//Rider requests the ride
rideRouter.get('/available-riders',  rideController.getAvailableRiders); //customer gets all the requests from riders
rideRouter.post('/accept',rideController.acceptRideRequestByCustomer); //customer accepts one rider and send otp to rider
rideRouter.delete('/reject-rider',rideController.rejectRider); //customer rejects rider
rideRouter.get('/verify-ride-otp',rideController.verifyRideOtp); //customer verifies rider by otp
rideRouter.post('/complete-ride',rideController.completedRide) //ride completes
rideRouter.post('/submit-ride-review',rideController.submitRideReview) //customer sends ride review


export default rideRouter;
