import { Request, Response } from 'express';
import Bid from '../models/bids';
import Ride from '../../rides-service/models/rides';
import IRequest from '../../../middleware/IRequest';

const submitBid = async (req: IRequest, res: Response) => {
  try {
    const { amount, rideId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ details: [{ message: 'User ID is missing' }] });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ details: [{ message: 'Ride not found' }] });
    }

    if (ride.status !== 'not-started') {
      return res.status(400).json({ details: [{ message: 'Ride already started or completed' }] });
    }

    if (amount < ride.minimumPrice) {
      return res.status(400).json({
        details: [{ message: `Bid must be at least Rs. ${ride.minimumPrice}` }],
      });
    }

    const existingBid = await Bid.findOne({ rideId, userId });
    if (existingBid) {
      return res.status(400).json({ details: [{ message: 'Already bid on this ride' }] });
    }

    const bid = new Bid({ rideId, userId, amount });
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
    console.error('Submit bid error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export default { submitBid };
