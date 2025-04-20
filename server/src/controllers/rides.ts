import { Request, Response } from 'express';
import Ride from '../models/rides';
import IRequest from '../middleware/IRequest';

export const findRide = async (req: IRequest, res: Response) => {
  try {
    // Destructure start_location and destination from the request body
    const { start_location, destination } = req.body;

    // Ensure customerId is set correctly (this should come from the auth middleware)
    const customerId = req.userId;

    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Customer ID is missing' });
    }

    // Create a new ride entry with customerId, start_location, and destination
    const ride = await Ride.create({
      customerId,
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
