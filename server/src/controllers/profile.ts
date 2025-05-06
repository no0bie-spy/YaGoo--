import { NextFunction, Response } from "express"
import IRequest from "../middleware/IRequest"
import Ride from "../models/rides"
import User from "../models/User";
import Bid from "../models/bid";
import Rider from "../models/rider";



const viewHistory = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: userId missing." });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    let rides: any[] = [];

    if (user.role === "rider") {
      rides = await Ride.find({ riderId: req.userId });
    } else if (user.role === "customer") {
      rides = await Ride.find({ customerId: req.userId });
    }

    if (rides.length === 0) {
      return res.status(404).json({ message: "No ride history found." });
    }

    const history = await Promise.all(
      rides.map(async (ride) => {
        const bid = await Bid.findById(ride.bidId);
        return {
          customer: ride.customerId,
          start_location: ride.start_location,
          destination: ride.destination,
          distance: ride.distance,
          amount: bid?.amount ?? "N/A"
        };
      })
    );

    return res.status(200).json({ rides: history });
  } catch (error) {
    console.error("Error fetching ride history:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const viewRiderProfile = async ( req: IRequest, res:Response, next: NextFunction) =>{
try{

  const { riderId } = req.body;
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: userId missing." });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "User not found!" });
  }
  
  const riderDetails = await Rider.findById(riderId);// check rider details in db

  if(!riderDetails){
    return res.status(400).json({
      message: false,
      details : [{ message: `Rider  Riding Details not found`}]
    })
  }
  
  const riderProfile = await User.findById(riderDetails.userId);

  if(!riderProfile){
    return res.status(400).json({
      message: false,
      details : [{ message: `Rider Normal Details not found`}]
    })
  }

  //Basic Rider Details
  const email = riderProfile.email;
  const phone = riderProfile.phone;
  const fullname = riderProfile.fullname;
  
//Rider Riding Details
const totalRides = riderDetails.totalRides;
const averageRating = riderDetails.averageRating
  
  return res.status(200).json({
    message: true,
    details: [
      {
        message: `Rider Profile successfully shown`,
       email: email,
       phone: phone,
       fullname: fullname,
       
       totalRides : totalRides,
       averageRating:averageRating
      }
    ]
  })



}
catch (e: unknown) {
  console.error('Complete ride error', e);
  return res.status(500).json({
    status: false,
    message: e instanceof Error ? e.message : 'An unknown error occurred',
  });
}

}
const profileController = {
    viewHistory,
    viewRiderProfile
}

export default profileController;
