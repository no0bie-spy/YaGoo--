import express from 'express';
import validate from '../middleware/validation';
import rideValidation from '../validations/rides';
import rideController from '../controllers/rides';
import otpController from '../controllers/otp';

const rideRouter = express.Router();

/**
 * Create Ride — includes creating start and destination address,
 * calculating distance, and minimum price.
 */
rideRouter.post(
  '/create',
  validate(rideValidation.findRide),
  rideController.createRideRequest
); // successfully create ride by customer

/**
 * Customer places a bid after creating a ride.
 */
rideRouter.post(
  '/bid',
  validate(rideValidation.placeBid),
  rideController.submitBid
); // customer places bid

/**
 * Cancel the ride before requesting a rider.
 */
rideRouter.delete('/cancel', rideController.cancelRide); // cancel ride by customer before requesting

/**
 * Rider retrieves all ride requests made by customers.
 */
rideRouter.get('/requests', rideController.getAllRequestedRides); // rider gets all the ride requests from customers

/**
 * Rider accepts a specific ride — this is how a rider requests to take the ride.
 */
rideRouter.post(
  '/rider-request',
  validate(rideValidation.requestRideByRider),
  rideController.requestRideAsRider
); // rider requests the ride

/**
 * Customer retrieves all the riders willing to take the ride.
 */
rideRouter.get('/available-riders', rideController.getAvailableRiders); // customer gets all the requests from riders

/**
 * Customer accepts a specific rider and sends OTP to the rider.
 */
rideRouter.post('/accept', rideController.acceptRideRequestByCustomer); // customer accepts one rider and sends OTP

/**
 * Customer rejects a rider.
 */
rideRouter.delete('/reject-rider', rideController.rejectRider); // customer rejects rider

/**
 * Customer verifies the ride by providing OTP.
 */
rideRouter.post('/verify-ride-otp', rideController.verifyRideOtp); // customer verifies rider by OTP

/**
 * Mark the ride as completed.
 */
rideRouter.post('/complete-ride', rideController.completedRide); // ride completes

/**
 * Customer submits a review after ride completion.
 */
rideRouter.post('/submit-ride-review', rideController.submitRideReview); // customer sends ride review

export default rideRouter;
