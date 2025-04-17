import { Request } from "express";

// Extending the Request interface to include userId
export default interface IRequest extends Request {
  userId?: string;  // Add userId property
}
