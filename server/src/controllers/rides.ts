import { Request, Response } from 'express';
import Ride from '../models/rides';
import IRequest from '../middleware/IRequest';
import Bid from '../models/bid';

const findRide = async (req: IRequest, res: Response) => {
  try {
    const { start_location, destination } = req.body;
    const customerId = req.userId;

    if (!customerId) {
      return res.status(400).json({ details: [{ success: false, message: 'Customer ID is missing' }] });
    }

    const ride = await Ride.create({
      customerId,
      start_location,
      destination,
      status: 'not-started',
      bids: [],
    });

    return res.status(201).json({ success: true, ride });
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
      return res.status(400).json({ success: false, message: 'User ID is missing from auth middleware' });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.status !== 'not-started') {
      return res.status(400).json({ success: false, message: 'Ride has already started or completed' });
    }
    const bid = new Bid({
      rideId,
      userId,
      amount,
    });

    await bid.save();

    return res.status(200).json({ success: true, message: 'Bid placed successfully', bid });
  } catch (e: unknown) {
    console.error('Bid error:', e);
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
};

export default rideController;
