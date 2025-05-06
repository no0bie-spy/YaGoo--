import { NextFunction, Response } from 'express';
import IRequest from '../middleware/IRequest';
import Ride from '../models/rides';
import User from '../models/User';
import Bid from '../models/bid';
import RiderDocuments from '../models/riderDocument';
import Vehicle from '../models/vehicle';

// Fetch user details (common for customer and rider)
const userDetails = async (
  req: IRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    // Ensure the request is authenticated
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the user in the database
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        details: [{ message: 'User does not exist' }],
      });
    }

    const { fullname, role, phone, isEmailVerified, email } = existingUser;

    // Prepare the base response object
    const responseData: any = {
      fullname,
      role,
      phone,
      isEmailVerified,
      email,
    };

    // If the user is a rider, fetch and include rider-specific data
    if (role === 'rider') {
      const riderDocs = await RiderDocuments.findOne({ riderId: userId });
      const vehicle = await Vehicle.findOne({ riderId: userId });

      if (riderDocs) {
        responseData.riderDocuments = {
          licenseNumber: riderDocs.licenseNumber,
          citizenshipNumber: riderDocs.citizenshipNumber,
          licensePhoto: riderDocs.licensePhoto,
          citizenshipPhoto: riderDocs.citizenshipPhoto,
        };
      }

      if (vehicle) {
        responseData.vehicle = {
          vehicleType: vehicle.vehicleType,
          vehicleName: vehicle.vehicleName,
          vehicleModel: vehicle.vehicleModel,
          vehicleNumberPlate: vehicle.vehicleNumberPlate,
          vehiclePhoto: vehicle.vehiclePhoto,
          vehicleNumberPlatePhoto: vehicle.vehicleNumberPlatePhoto,
          vehicleBlueBookPhoto: vehicle.vehicleBlueBookPhoto,
        };
      }
    }

    return res.status(200).json({
      message: 'User details shown',
      user: responseData,
    });
  } catch (e: unknown) {
    console.error('Error fetching user details:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};


// Edit profile details (fullname and phone)
const editProfileDetails = async (
  req: IRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userId = req.userId; // Get user ID from authentication middleware

    // Check if userId is available (i.e., user is authenticated)
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify user exists in the database
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        details: [{ message: 'User does not exist' }],
      });
    }

    // Extract fields to be updated from request body
    const { fullname, phone } = req.body;

    // Update user details and return the new document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullname, phone },
      { new: true } // Return the updated document
    );

    return res.status(200).json({
      message: 'User details updated successfully',
      user: updatedUser, // Return updated user data if needed
    });

  } catch (e: unknown) {
    console.error('Error updating user details:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};

//View history for both riders and customer
const viewHistory = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if the user is authenticated
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized: userId missing.' });
    }

    // Find the user based on userId
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found!' });
    }

    let rides: any[] = [];

    // Retrieve rides based on user role
    if (user.role === 'rider') {
      rides = await Ride.find({ riderId: req.userId });
    } else if (user.role === 'customer') {
      rides = await Ride.find({ customerId: req.userId });
    }

    // If no rides found, return empty array
    if (rides.length === 0) {
      return res.status(200).json({ rides: [] });
    }

    // Format each ride with related bid and time info
    const history = await Promise.all(
      rides.map(async (ride) => {
        const bid = await Bid.findById(ride.bidId);

        // Format total ride time in "Xm Ys" format
        let formattedTime = 'N/A';
        if (ride.totalTime !== undefined && ride.totalTime !== null) {
          const totalSeconds = ride.totalTime;
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          formattedTime = `${minutes}m ${seconds}s`;
        }

        return {
          customer: ride.customerId,
          start_location: ride.start_location,
          destination: ride.destination,
          distance: ride.distance,
          amount: bid?.amount ?? 'N/A',
          status: ride.status,
          date: ride.createdAt,
          totalTime: formattedTime,
        };
      })
    );

    return res.status(200).json({ rides: history });

  } catch (error) {
    console.error('Error fetching ride history:', error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

const profileController = {
  userDetails,          // Get the logged-in user's profile details
  editProfileDetails,   // Update the logged-in user's profile details
  viewHistory,          // Retrieve the ride history of the logged-in user
};

export default profileController;
