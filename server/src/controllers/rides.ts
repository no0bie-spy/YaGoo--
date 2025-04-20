import { Request, Response } from 'express';
import User from '../models/User';
import Ride from '../models/rides';

export const findRide = async (req: Request, res: Response) => {
  try {
    const { email, start_location, destination } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with the provided email' });
    }

    const ride = await Ride.create({
      customerId: user._id,
      start_location,
      destination,
      status: 'not-started',
    });

    return res.status(201).json({ success: true, ride });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save ride info',
      error: error instanceof Error ? error.message : error,
    });
  }
};
