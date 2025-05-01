import { Request } from "express";

// Extending the Request interface to include userId and ride
export default interface IRequest extends Request {
  userId?: string;  // Add userId property
  ride?: any;       // Add ride property (replace `any` with the actual type of the ride object if needed)
}
