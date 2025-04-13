import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import RiderDocuments from '../models/riderDocument';
import Vehicle from '../models/vehicle';

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      email,
      fullname,
      password,
      role,
      phone,
      licenseNumber,
      licensePhoto,
      citizenshipNumber,
      citizenshipPhoto,
      vehicleType,
      vehicleName,
      vehicleModel,
      vehiclePhoto,
      vehicleNumberPlate,
      vehicleNumberPlatePhoto,
    } = req.body;

    // 🚫 Check for rider-specific fields
    if (role === 'rider') {
      const missingFields = [
        !licenseNumber && 'licenseNumber',
        !licensePhoto && 'licensePhoto',
        !citizenshipNumber && 'citizenshipNumber',
        !citizenshipPhoto && 'citizenshipPhoto',
        !vehicleType && 'vehicleType',
        !vehicleName && 'vehicleName',
        !vehicleModel && 'vehicleModel',
        !vehiclePhoto && 'vehiclePhoto',
        !vehicleNumberPlate && 'vehicleNumberPlate',
        !vehicleNumberPlatePhoto && 'vehicleNumberPlatePhoto',
      ].filter(Boolean);

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required rider fields: ${missingFields.join(', ')}`,
        });
      }
    }

    // 👤 Create user
    const user = await User.create({
      email,
      fullname,
      password,
      role,
      phone,
      isEmailVerified: false,
    });

    // 🛵 If rider, attach vehicle and documents
    if (role === 'rider') {
      await Vehicle.create({
        vehicleType,
        vehicleName,
        vehicleModel,
        vehiclePhoto,
        vehicleNumberPlate,
        vehicleNumberPlatePhoto,
        riderId: user._id,
      });

      await RiderDocuments.create({
        licenseNumber,
        licensePhoto,
        citizenshipNumber,
        citizenshipPhoto,
        isRiderVerified: false,
        riderId: user._id,
      });
    }

    res.status(201).json({
      message: 'Registered successfully',
      user,
    });
  } catch (e: unknown) {
    console.error('Register error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { userId: user._id, role: user.role },
//       process.env.JWT_SECRET || 'your-secret-key',
//       { expiresIn: '7d' }
//     );

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         role: user.role,
//         name: user.name,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({ error: 'Login failed' });
//   }
// };

const authController = {
  register,
};

export default authController;
