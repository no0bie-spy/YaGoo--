import { Request, Response } from 'express';
import Ride from '../models/rides';
import IRequest from '../middleware/IRequest';
import Bid from '../models/bid';
import { calculateRoadDistance } from '../services/distance';
import RiderList from '../models/riderLIst';
import User from '../models/User';
import { Otp } from '../models/otp';
import Review from '../models/review';
import Vehicle from '../models/vehicle';
const BASE_RATE = 15; // Rs. 15 per km

const findRide = async (req: IRequest, res: Response) => {
  try {
    const { start_location, destination } = req.body;
    const customerId = req.userId;

    if (!customerId) {
      return res.status(400).json({
        details: [{ message: 'Customer ID is missing' }],
      });
    }

    if (!start_location || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: [{ message: 'Start location and destination are required' }],
      });
    }

    // Further validation for coordinates (lat range check)
    if (
      start_location.coordinates.latitude < -90 ||
      start_location.coordinates.latitude > 90 ||
      destination.coordinates.latitude < -90 ||
      destination.coordinates.latitude > 90
    ) {
      return res.status(400).json({
        details: [{ message: 'Invalid latitude/longitude values' }],
      });
    }

    const distance = await calculateRoadDistance(
      start_location.coordinates.latitude,
      start_location.coordinates.longitude,
      destination.coordinates.latitude,
      destination.coordinates.longitude
    );
    console.log('Distance:', distance);

    if (!distance || distance <= 0) {
      return res.status(400).json({
        details: [{ message: 'Unable to calculate valid route distance' }],
      });
    }

    const minimumPrice = Math.round(distance * BASE_RATE);
    console.log('Minimum Price:', minimumPrice);
    const ride = await Ride.create({
      customerId,
      start_location,
      destination,
      distance,
      minimumPrice,
      status: 'not-started',
    });

    return res.status(201).json({
      success: true,
      ride,
      minimumPrice,
      message: 'Ride created successfully',
    });
  } catch (e: unknown) {
    console.error('Register error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

const placeBid = async (req: IRequest, res: Response) => {
  try {
    const { amount, rideId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        details: [{ message: 'User ID is missing' }],
      });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        details: [{ message: 'Ride not found' }],
      });
    }

    if (ride.status !== 'not-started') {
      return res.status(400).json({
        details: [{ message: 'Ride has already started or completed' }],
      });
    }

    if (amount < ride.minimumPrice) {
      return res.status(400).json({
        details: [
          { message: `Bid amount must be at least Rs. ${ride.minimumPrice}` },
        ],
      });
    }

    const existingBid = await Bid.findOne({ rideId, userId });
    if (existingBid) {
      return res.status(400).json({
        details: [{ message: 'You have already placed a bid on this ride' }],
      });
    }

    const bid = new Bid({
      rideId,
      userId,
      amount,
    });

    await bid.save();

    return res.status(200).json({
      success: true,
      message: 'Bid placed successfully',
      bid: {
        rideId: bid.rideId,
        userId: bid.userId,
        amount: bid.amount,
        createdAt: bid.createdAt,
      },
    });
  } catch (e: unknown) {
    console.error('Register error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

const requestRideByRider = async (req: IRequest, res: Response) => {
  try {
    const { rideId } = req.body;
    const riderId = req.userId;

    if (!riderId) {
      return res.status(400).json({
        details: [{ message: 'User ID (riderId) is missing' }],
      });
    }

    if (!rideId) {
      return res.status(400).json({
        error: 'rideId is required',
        details: [
          {
            message: 'rideId is required',
            path: ['rideId'],
            type: 'any.required',
            context: { label: 'rideId', key: 'rideId' },
          },
        ],
      });
    }

    // Ensure rideId is treated as a valid ObjectId
    const rideRequest = await RiderList.create({
      riderId,
      rideId,
      status: 'not-accepted',
    });

    return res.status(201).json({
      success: true,
      rideRequest,
      message: 'Ride request created successfully',
    });
  } catch (e: unknown) {
    console.error('Request ride by rider error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};


const findRideByRider = async (req: Request, res: Response) => {
  try {

    // const customerId = req.userId;
    const rides = await Ride.find({status: "requested"});
    console.log(rides);

   // Check if no rides were found
   if (rides.length === 0) {
    return res.status(400).json({
      details: [{ message: 'No rides found.' }],
    });
  }

    
    // Map over the rides to send a specific structure to the frontend
    const rideDetails = rides.map((ride) => ({
      rideId: ride._id,
      startDestination: ride.start_location,
      endDestination: ride.destination,
      riderId: ride.riderId,
    }));

    return res.status(201).json({
      success: true,
   ride : rideDetails,
   rides,
      message: 'Ridewswww created successfully',
    });
  } catch (e: unknown) {
    console.error('Register error:', e);
  }}

const findRider = async (req: IRequest, res: Response) => {
  try {
    const riders = await RiderList.find({  }).lean();
    const riderListIds=riders.map((rl)=>rl._id)

    const riderIds = riders.map((r) => r.riderId);

    const users = await User.find({ _id: { $in: riderIds } }).lean();

    const vehicles = await Vehicle.find({ riderId: { $in: riderIds } }).lean();

    const reviews = await Review.find({ riderId: { _id: riderIds } }).lean();

    const data = riders.map((rider) => {
      const user = users.find(
        (u) => u._id.toString() === rider.riderId.toString()
      );
      const vehicle = vehicles.find(
        (v) => v.riderId.toString() === rider.riderId.toString()
      );
      const review = reviews.find(
        (r) => r.riderId.toString() === rider.riderId.toString()
      );
      return {
        riderListIds:riderListIds,
        name: user?.fullname || 'N/A',
        rating: review?.averageRating || 0,
        vehicle: vehicle?.vehicleName || 'Not registered',
      };
    });

    return res.status(200).json({
      message: 'Successfully retrieved riders details',
      data,
    });
  } catch (e: unknown) {
    console.error('Logout error:', e);

    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

const verifyRiderOtp = async (req: IRequest, res: Response) => {
  try {
    const { email, riderOtp } = req.body;

    const otpRecord = await Otp.findOne({ email: email });

    if (!otpRecord) {
      return res.json({
        details: [
          {
            message: 'Opt not found',
          },
        ],
      });
    }

    if (otpRecord.OTP !== riderOtp) {
      return res.json({
        details: [
          {
            message: 'Incorrect Otp',
          },
        ],
      });
    } else if (otpRecord.OTP === riderOtp) {
    
      return res.json({
        message: 'Otp verified',
      });
    }
  } catch (e: unknown) {
    console.error('Register error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};


const customerAcceptRider = async (req: IRequest, res: Response) => {
  try {
    const { rideListId } = req.body;
    const customerId = req.userId;

    if (!customerId) {
      return res.status(400).json({
        details: [{ message: 'Customer ID is missing' }],
      });
    }

    if (!rideListId) {
      return res.status(400).json({
        success: false,
        message: 'RideList ID is required',
        details: [{ message: 'RideList ID is required' }],
      });
    }

    // Find the ride request
    const rideRequest = await RiderList.findById(rideListId);

    if (!rideRequest || rideRequest.status !== 'not-accepted') {
      return res.status(404).json({
        success: false,
        message: 'Ride request not found or already accepted',
      });
    }

    // Accept the ride request
    rideRequest.status = 'accepted';
    await rideRequest.save();

    // Find ALL riderLists for that rideId
    const allRideRequests = await RiderList.find({
      rideId: rideRequest.rideId,
    });

    // Remove all except the accepted one
    for (const request of allRideRequests) {
      if (request._id.toString() !== rideListId) {
        await RiderList.findByIdAndDelete(request._id);
      }
    }

    // Find and update the ride
    const ride = await Ride.findById(rideRequest.rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    ride.status = 'matched';
    ride.riderId = rideRequest.riderId;
    await ride.save();

    return res.status(200).json({
      success: true,
      message: 'Ride accepted and matched successfully',
      rideRequest,
      ride,
    });
  } catch (e: unknown) {
    console.error('Customer accept ride error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

const rideController = {
  findRide,
  placeBid,
  requestRideByRider,
  findRideByRider,
  findRider,
  verifyRiderOtp,
  customerAcceptRider,  
};

export default rideController;
