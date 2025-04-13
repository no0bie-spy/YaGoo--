import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['customer', 'rider', 'admin']),
  name: z.string().min(2),
  phone: z.string().min(10),
  licenseNumber: z.string().optional(),
  bikeNumberPlate: z.string().optional(),
  bikeModel: z.string().optional(),
}).refine((data) => {
  if (data.role === 'rider') {
    return data.licenseNumber && data.bikeNumberPlate && data.bikeModel;
  }
  return true;
}, {
  message: "Rider registration requires license number, bike number plate, and bike model"
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  try {
    registerSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(400).json({ error: 'Invalid input' });
    }
  }
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(400).json({ error: 'Invalid input' });
    }
  }
};