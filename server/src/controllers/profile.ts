import { NextFunction, Response } from "express"
import IRequest from "../middleware/IRequest"
import Ride from "../models/rides"
import User from "../models/User";
import Bid from "../models/bid";

const viewHistory = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const user: any = await User.findById(req.userId);
  
      let ride: any; 
  
      if (user.role === "rider") {
        ride = await Ride.findOne({ riderId: req.userId });
      } else if (user.role === "customer") {
        ride = await Ride.findOne({ customerId: req.userId });
      }
  
      if (!ride) {
        return res.status(404).json({ message: "Ride history not found" });
      }
  

      const bid:any =await Bid.findOne({ _id: ride.bidId})
      return res.status(200).json({
        ride: {
          customer: ride.customerId,
          start_location: ride.start_location,
          destination: ride.destination,
          distance : ride.distance,
          amount : bid.amount
        }
      });
  
    } catch (error) {
      console.error("Error fetching rider history:", error);
      return res.status(500).json({ message: "Something went wrong." });
    }
  };
  
const profileController = {
    viewHistory
}

export default profileController;
