import { NextFunction, Request, Response } from 'express';
import Ride from '../models/rides';
import IRequest from '../middleware/IRequest';
import Bid from '../models/bid';
import { calculateRoadDistance } from '../services/distance';
import User from '../models/User';
import { Otp } from '../models/otp';
import Review from '../models/review';
import Vehicle from '../models/vehicle';
import { defaultMaxListeners } from 'events';
import Rider from '../models/rider';
import { sendRideOtp } from '../services/mailer';
import bcrypt from 'bcrypt';
import RiderList from '../models/riderList';

const BASE_RATE = 15; // Rs. 15 per km

const createRideRequest = async (req: IRequest, res: Response) => {
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

const submitBid = async (req: IRequest, res: Response) => {
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

    ride.status = 'requested';
    ride.bidId = bid._id;
    await ride.save();

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

const cancelRide = async (req: IRequest, res: Response) => {
  try {
    const { rideId } = req.body;

    if (!rideId) {
      return res.status(400).json({
        success: false,
        message: 'Ride ID is required',
      });
    }
    console.log('cancel' + rideId);
    const deletedRide = await Ride.findByIdAndDelete(rideId);

    if (!deletedRide) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Ride cancelled and deleted successfully',
    });
  } catch (e: unknown) {
    console.error('Cancel ride error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

const requestRideAsRider = async (req: IRequest, res: Response) => {
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

    //to check it already exists or not
    const existingRequest = await RiderList.findOne({
      riderId,
      rideId,
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Ride request already exists.' });
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

const getAllRequestedRides = async (req: Request, res: Response) => {
  try {
    // Fetch rides where status is "requested"
    const rides = await Ride.find({ status: 'requested' });

    // Check if no rides were found
    if (rides.length === 0) {
      return res.status(400).json({
        details: [{ message: 'No rides with requested status found.' }],
      });
    }

    // Map over the rides to send a specific structure to the frontend
    const rideDetails = await Promise.all(
      rides.map(async (ride) => {
        // Fetch customer by the customerId for each ride
        const customer = await User.findById(ride.customerId);
        // fetch bid amount from bidModel
        const bid = await Bid.findOne({ _id: ride.bidId });
        return {
          customerName: customer?.fullname,
          customerEmail: customer?.email,
          rideId: ride._id,
          startDestination: ride.start_location.address,
          endDestination: ride.destination.address,
          riderId: ride.riderId,
          bid: bid?.amount,
        };
      })
    );

    // Return the rides with customer details
    return res.status(200).json({
      success: true,
      rides: rideDetails,
    });
  } catch (e: unknown) {
    console.error('Error:', e);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAvailableRiders = async (req: IRequest, res: Response) => {
  try {
    const { rideId } = req.query;
    console.log('Ride ID:', rideId);
    if (!rideId) {
      return res
        .status(400)
        .json({ message: 'rideId is required in the query parameters' });
    }

    // Find riders who have accepted the specific rideId
    const riders = await RiderList.find({ rideId: rideId }).lean();
    console.log('Riders found:', riders);

    const riderIds = riders.map((r) => r.riderId);
    console.log('Rider IDs:', riderIds);

    // Find user details for these riders
    const users = await User.find({ _id: { $in: riderIds } }).lean();
    console.log('Users found:', users);

    // Find additional rider information
    const ridersData = await Rider.find({
      userId: { $in: riderIds },
    }).lean();
    console.log('Riders data:', ridersData);

    // Find vehicle details for these riders
    const vehicles = await Vehicle.find({ riderId: { $in: riderIds } }).lean();
    console.log('Vehicles found:', vehicles);

    const data = riders.map((rider) => {
      const user = users.find(
        (u) => u._id.toString() === rider.riderId.toString()
      );

      const riderInfo = ridersData.find(
        (r) => r.userId.toString() === rider.riderId.toString()
      );

      const vehicle = vehicles.find(
        (v) => v.riderId.toString() === rider.riderId.toString()
      );

      return {
        riderListId: rider._id,
        name: user?.fullname || 'N/A',
        rating: riderInfo?.averageRating?.toFixed(1) || '0',
        vehicle: vehicle?.vehicleName || 'Not registered',
      };
    });

    return res.status(200).json({
      message: 'Successfully retrieved rider details for the accepted ride',
      data,
    });
  } catch (e: unknown) {
    console.error('Find rider error:', e);
    return res.status(500).json({
      message: e instanceof Error ? e.message : 'An unknown error occurred',
    });
  }
};

const verifyRideOtp = async (req: IRequest, res: Response) => {
  try {
    const { email, rideId, riderOtp } = req.body;

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(404).json({
        status: false,
        details: [{ message: 'OTP not found' }],
      });
    }
    console.log('otp aayo', otpRecord.OTP);
    const isOtpValid = await bcrypt.compare(riderOtp, otpRecord.OTP);
    if (!isOtpValid) {
      return res.status(400).json({
        status: false,
        details: [{ message: 'Incorrect OTP' }],
      });
    }

    const ride = await Ride.findOne({ _id: rideId });

    if (!ride) {
      return res.status(404).json({
        status: false,
        message: 'Ride not found',
      });
    }

    ride.status = 'in-progress';
    ride.startTimer = new Date();
    console.log('timer ');
    await ride.save();

    // Delete the OTP after successful verification
    await Otp.deleteOne({ email });

    return res.status(200).json({
      status: true,
      message: 'OTP verified. Ride started.',
    });
  } catch (e: unknown) {
    console.error('Verify OTP error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
const acceptRideRequestByCustomer = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
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
    const rideRequest = await RiderList.findOne({ _id: rideListId });

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
    const rideId = ride._id;
    ride.status = 'matched';
    ride.riderId = rideRequest.riderId; // Use riderId from the RideList
    await ride.save();

    const riderDetails = await User.findOne({ _id: ride.riderId });
    // Generate OTP

    if (!riderDetails) {
      return res.status(400).json({
        details: [{ message: 'Rider Details Document  is missing' }],
      });
    }
    const email = riderDetails.email;
    console.log('email is', email);
    const { token, info } = await sendRideOtp(email!);
    console.log('token', token, info);

    //hash the otp to save into the database
    const hashedToken = await bcrypt.hash(token, 10);

    const expiryOTP = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 minutes

    await Otp.updateOne(
      { email }, // find by email
      {
        $set: {
          OTP: hashedToken,
          otpExpiresAt: expiryOTP,
        },
      },
      { upsert: true } // insert new if not exists
    );

    return res.status(200).json({
      success: true,
      message: 'Ride accepted and OTP sent to the rider',
      rideRequest,
      rideId,
      email,
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

const rejectRider = async (req: IRequest, res: Response) => {
  try {
    const { rideListId } = req.body;

    if (!rideListId) {
      return res.status(400).json({
        success: false,
        message: 'RideList ID is required',
      });
    }

    const deletedRideRequest = await RiderList.findByIdAndDelete(rideListId);

    if (!deletedRideRequest) {
      return res.status(404).json({
        success: false,
        message: 'Ride request not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Ride request rejected and deleted successfully',
    });
  } catch (e: unknown) {
    console.error('Reject rider error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

const customerNotArrived = async function (req: IRequest, res: Response) {
  try {
    const { rideListId } = req.body;

    const riderList = await RiderList.findOne({ _id: rideListId });

    if (!riderList) {
      return res.status(404).json({ message: ' RiderList not found ' });
    }

    const ride = await Ride.findById({ _id: riderList.rideId });

    if (!ride) {
      return res.status(404).json({ message: ' Ride not found ' });
    }

    ride.customerArrived = true;
    ride.save();

    return res.status(200).json({
      message: "Customer didn't arrive,you can submit report!",
    });
  } catch (e: unknown) {
    console.error('error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

const viewRiderOtp = async function (req: IRequest, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        details: [{ message: 'User ID is missing' }],
      });
    }

    const user: any = await User.findById(userId);

    const otpRecord = await Otp.findOne({ email: user.email });

    const validOtp = otpRecord?.OTP;

    const validEmail = otpRecord?.email;

    return res.json({
      message: `Otp has been received in your mail${validEmail}`,
      otp: validOtp,
      email: validEmail,
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

const completedRide = async (req: IRequest, res: Response) => {
  try {
    const { rideId } = req.body;

    const existingRide = await Ride.findOne({ _id: rideId });
    console.log('existingRide', existingRide);
    if (!existingRide) {
      return res.status(404).json({
        status: false,
        details: [{ message: 'Ride not found' }],
      });
    }

    if (!existingRide.startTimer) {
      return res.status(400).json({
        status: false,
        details: [{ message: 'Ride has not started yet' }],
      });
    }

    if (existingRide.paymentStatus === 'not received') {
      return res.status(400).json({
        status: false,
        details: [{ message: 'Please make payment first' }],
      });
    }
    existingRide.status = 'completed';
    existingRide.endTimer = new Date();

    const timeDifferenceMs =
      existingRide.endTimer.getTime() - existingRide.startTimer.getTime();

    const totalSeconds = Math.floor(timeDifferenceMs / 1000);
    existingRide.totalTime = totalSeconds; // save as number in seconds

    await existingRide.save();

    //increase total rides number after completing ride
    const rider: any = await Rider.findOne({ userId: existingRide.riderId });
    if (!rider) {
      console.log('rider not found');
      return res.status(404).json({
        status: false,
        details: [{ message: 'Rider not found' }],
      });
    }
    console.log('rider', rider);

    console.log('total rides', rider.totalRides);

    rider.totalRides = (await rider.totalRides) + 1;
    await rider.save();

    // Rider.updateOne({
    //   totalRides: =  rider.totalRides + 1
    // })

    // ✅ Get riderId from the ride and increment totalRides in Rider model
    const riderId = existingRide.riderId;

    return res.status(200).json({
      status: true,
      message: 'Ride completed',
      totalTime: totalSeconds,
      riderId,
    });
  } catch (e: unknown) {
    console.error('Complete ride error', e);
    return res.status(500).json({
      status: false,
      message: e instanceof Error ? e.message : 'An unknown error occurred',
    });
  }
};

const submitRideReview = async (req: IRequest, res: Response) => {
  try {
    const { rideId, riderId, comment, rating } = req.body;

    // Check if the ride exists
    const existingRide = await Ride.findOne({ _id: rideId });
    if (!existingRide) {
      return res.status(400).json({
        status: false,
        details: [{ message: 'Ride not found' }],
      });
    }

    // Fetch the rider using the correct field (e.g., userId)
    const rider: any = await Rider.findOne({ userId: riderId });
    if (!rider) {
      return res.status(400).json({
        status: false,
        details: [{ message: 'Rider not found' }],
      });
    }

    // Ensure `averageRating` and `totalRides` have default values
    rider.averageRating = rider.averageRating || 0;
    rider.totalRides = rider.totalRides || 0;

    // Calculate the new average rating
    const newRating =
      (rider.averageRating * rider.totalRides + rating) /
      (rider.totalRides + 1);

    // Update the rider's rating and total rides
    rider.averageRating = parseFloat(newRating.toFixed(1)); // Round to 1 decimal place
    rider.totalRides += 1;
    await rider.save();

    // Create the review
    const review = await Review.create({
      rideId,
      riderId,
      comment,
      rating,
    });

    return res.json({
      review,
      message: 'Reviewed Successfully',
    });
  } catch (e: unknown) {
    console.error('Submit ride review error:', e);
    return res.status(500).json({
      status: false,
      message: e instanceof Error ? e.message : 'An unknown error occurred',
    });
  }
};

const payment = async (req: IRequest, res: Response) => {
  try {
    const { rideId } = req.body;
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

    ride.paymentStatus = 'completed';
    await ride.save();

    return res.status(200).json({
      success: true,
      message: 'Payment received successfully',
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

const topRidersByRides = async (req: IRequest, res: Response) => {
  try {
    // Get all riders
    const riders = await User.find({ role: 'rider' });

    // Count rides for each rider
    const ridersWithRideCount = await Promise.all(
      riders.map(async (rider) => {
        const totalRides = await Ride.countDocuments({ riderId: rider._id });
        return {
          riderId: rider._id,
          fullname: rider.fullname,
          phone: rider.phone,
          email: rider.email,
          totalRides,
        };
      })
    );

    // Sort and return top 10
    const topRiders = ridersWithRideCount
      .sort((a, b) => b.totalRides - a.totalRides)
      .slice(0, 10);

    return res.status(200).json({ topRiders });
  } catch (error) {
    console.error('Error fetching top riders:', error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const rideController = {
  createRideRequest,          // Customer creates a new ride request
  submitBid,                  // Customer places a bid for a ride
  cancelRide,                 // Customer cancels a ride before it’s accepted by a rider
  getAllRequestedRides,       // Rider retrieves all ride requests from customers
  requestRideAsRider,         // Rider sends a request to take a specific ride
  getAvailableRiders,         // Customer retrieves all rider requests for their ride
  acceptRideRequestByCustomer, // Customer accepts one rider and sends them an OTP
  rejectRider,                // Customer rejects a rider’s request
  customerNotArrived,         // Rider reports that the customer hasn’t arrived at the pickup point
  viewRiderOtp,               // Rider views the OTP sent by the customer
  verifyRideOtp,              // Customer verifies the rider using the provided OTP
  completedRide,              // Marks the ride as completed
  submitRideReview,           // Customer submits a review after the ride is completed
  payment,                    // Rider confirms that payment has been received
  topRidersByRides,           // Retrieve top riders based on the number of completed rides
  
};

export default rideController;
