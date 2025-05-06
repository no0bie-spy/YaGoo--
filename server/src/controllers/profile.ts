import { NextFunction, Response } from "express"
import IRequest from "../middleware/IRequest"
import Ride from "../models/rides"
import User from "../models/User";
import Bid from "../models/bid";


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

const profileController = {
    viewHistory
}

export default profileController;
