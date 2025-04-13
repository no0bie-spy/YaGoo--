import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import RiderDocuments from '../models/riderDocument';

const register = async (req: Request, res: Response, next: NextFunction) => {
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


  const user=await User.create({
    email,
    fullname,
    password,
    role,
    phone,
    isEmailVerified:false
  })

  if(role==="rider"){
    const rider=await RiderDocuments.create({
      
    })
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
