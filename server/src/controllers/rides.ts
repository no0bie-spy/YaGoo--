import { Request, Response } from 'express';
import Ride from '../models/rides';
import IRequest from '../middleware/IRequest';

const findRide = async (req: IRequest, res: Response) => {
  try {
    // Destructure start_location and destination from the request body
    const { start_location, destination } = req.body;

    // Ensure customerId is set correctly (this should come from the auth middleware)
    const customerId = req.userId;
    console.log('Customer ID:', customerId); // Debugging log

    if (!customerId) {
      return res.status(400).json({ details: [{ sucress:false, message: 'Customer ID is missing ' }] });
    }
    
    // Create a new ride entry with customerId, start_location, and destination
    const ride = await Ride.create({
      customerId,
      start_location,
      destination,
      status: 'not-started', 
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


const rideController = {
  findRide,
};
export default rideController;