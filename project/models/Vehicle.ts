// project/models/Vehicle.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IMaintenanceRecord {
  date: Date;
  description: string;
  status: string;
}

export interface IVehicle {
  brand: string;
  model: string; // frontend expects separate brand + model
  licensePlate: string;
  status: "available" | "active" | "maintenance";
  instructorId?: mongoose.Types.ObjectId | null;
  maintenanceHistory: IMaintenanceRecord[];
}

const MaintenanceSchema = new Schema<IMaintenanceRecord>({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
});

const VehicleSchema = new Schema<IVehicle>({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  licensePlate: { type: String, required: true, unique: true },
  status: { type: String, default: "available" },
  instructorId: { type: Schema.Types.ObjectId, ref: "Instructor", default: null },
  maintenanceHistory: { type: [MaintenanceSchema], default: [] },
}, { timestamps: true });

export default (models.Vehicle as mongoose.Model<IVehicle>) || model<IVehicle>("Vehicle", VehicleSchema);
