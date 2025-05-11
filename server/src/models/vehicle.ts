import { Document, Schema, model, Types } from 'mongoose';

type VehicleType = 'bike' | 'scooter' | 'car' | 'others';

interface VehicleInterface extends Document {
  vehicleType: VehicleType;
  vehicleName: string;
  vehicleModel: string;
  vehiclePhoto: string;
  vehicleNumberPlate: string;
  vehicleNumberPlatePhoto: string;
  vehicleBlueBookPhoto: string;
  isVehicleVerified: boolean;
  riderId: Types.ObjectId;
}

const vehicleSchema = new Schema<VehicleInterface>(
  {
    vehicleType: {
      type: String,
      required: true,
      enum: ['bike', 'scooter', 'car', 'others'], 
    },
    vehicleName: {
      type: String,
      required: true,
    },
    vehicleModel: {
      type: String,
      required: true,
    },
    vehiclePhoto: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleNumberPlate: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleNumberPlatePhoto: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleBlueBookPhoto: {
      type: String,
      required: true,
      unique: true,
    },
    isVehicleVerified: {
      type: Boolean,
      default: false, 
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = model<VehicleInterface>('Vehicle', vehicleSchema);

export default Vehicle;
