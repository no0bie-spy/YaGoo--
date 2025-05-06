import { NextFunction, Response } from 'express';
import IRequest from '../middleware/IRequest';
import Ride from '../models/rides';
import User from '../models/User';
import Bid from '../models/bid';
import RiderDocuments from '../models/riderDocument';
import Vehicle from '../models/vehicle';

//fetch user details
const userDetails = async (
  req: IRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const user = req.userId;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({
        details: [{ message: 'User does not exist' }],
      });
    }

    const fullname = existingUser.fullname;
    const role = existingUser.role;
    const phone = existingUser.phone;
    const isEmailVerified = existingUser.isEmailVerified;
    const email = existingUser.email;

    const responseData: any = {
      fullname,
      role,
      phone,
      isEmailVerified,
      email,
    };

    // If the user is a rider, fetch rider-specific details
    if (role === 'rider') {
      const riderDocs = await RiderDocuments.findOne({ riderId: user });
      const vehicle = await Vehicle.findOne({ riderId: user });

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
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// edit profile details
const editProfileDetails = async (
  req: IRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {

    const user = req.userId; // get user from the middleware token

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({
        details: [{ message: 'User does not exist' }],
      });
    }

    // modify user data
    const { fullname, phone} = req.body;

    const updatedData = await User.findByIdAndUpdate(user,  {  fullname, phone },
      { new: true } // `new: true` returns the updated document
    );


    return res.status(200).json({
      message: 'User Details Updated Successfully',
       user: updatedData, // to shown if necessary
    });
  } catch (e: unknown) {
    console.error('Error fetching user details:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};



const viewHistory = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized: userId missing.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found!' });
    }

    let rides: any[] = [];

    if (user.role === 'rider') {
      rides = await Ride.find({ riderId: req.userId });
    } else if (user.role === 'customer') {
      rides = await Ride.find({ customerId: req.userId });
    }

    // If no rides are found, return an empty array
    if (rides.length === 0) {
      return res.status(200).json({ rides: [] });
    }

    const history = await Promise.all(
      rides.map(async (ride) => {
        const bid = await Bid.findById(ride.bidId);

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
  userDetails,
  editProfileDetails,
  viewHistory,
};

export default profileController;
