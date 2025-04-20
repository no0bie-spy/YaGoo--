import { Request, Response } from 'express';
import User from '../models/User';
import Ride from '../models/rides';
import Bid from '../models/bid';


interface SetLocationRequest {
    user_id: string;
    location: string;
  }
  
  interface CreateRideRequest {
    customer_id: string;
    start_location: string;
    destination: string;
    otp_start: string;
    status: 'requested' | 'matched' | 'in-progress' | 'completed' | 'cancelled';
  }
  
  interface BidRideRequest {
    rider_id: string;
    ride_id: string;
    bid_amount: number;
  }

  interface AcceptBidRequest {
    ride_id: string;
    bid_id: string;
  }
  
  interface UpdateRideStatusRequest {
    status: 'requested' | 'matched' | 'in-progress' | 'completed' | 'cancelled';
  }
  