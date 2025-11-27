import mongoose, { Schema, Document, models } from "mongoose";

export interface IVehicle extends Document {
  model: string;
  licensePlate: string;
  category: string; // A / B / C ...
  available: boolean;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    model: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Vehicle ||
  mongoose.model<IVehicle>("Vehicle", VehicleSchema);
