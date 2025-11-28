// project/models/Vehicle.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IMaintenanceRecord {
  date: Date;
  description: string;
  status: string;
}

export interface IVehicle extends Document {
  category: string;
  vehicleModel: string;   // renamed to avoid collision with mongoose.Document.model
  licensePlate: string;
  status: "available" | "active" | "maintenance";
  maintenanceHistory: IMaintenanceRecord[];
}

const MaintenanceSchema = new Schema<IMaintenanceRecord>({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
});

const VehicleSchema = new Schema<IVehicle>(
  {
    category: { type: String, required: true },
    vehicleModel: { type: String, required: true }, // renamed property
    licensePlate: { type: String, required: true, unique: true },
    status: { type: String, default: "available" },
    maintenanceHistory: { type: [MaintenanceSchema], default: [] },
  },
  { timestamps: true }
);

export default (models.Vehicle as mongoose.Model<IVehicle>) ||
  model<IVehicle>("Vehicle", VehicleSchema);
