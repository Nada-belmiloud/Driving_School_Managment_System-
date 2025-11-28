// project/models/Instructor.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IAvailability {
  date: Date;
  startTime?: string | null;
  endTime?: string | null;
}

export interface IInstructor extends Document {
  name: string;
  phone: string;
  email: string;
  specialization: string;
  hireDate: Date;
  vehicleId?: mongoose.Types.ObjectId | null;
  availability: IAvailability[];
}

const phoneRegex = /^\d{10}$/;
const emailRegex = /^\S+@\S+\.\S+$/;

const AvailabilitySchema = new Schema<IAvailability>({
  date: { type: Date, required: true },
  startTime: { type: String, default: null },
  endTime: { type: String, default: null },
});

const InstructorSchema = new Schema<IInstructor>(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [phoneRegex, "Phone must be 10 digits"],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [emailRegex, "Invalid email format"],
    },
    specialization: { type: String, required: true },
    hireDate: { type: Date, default: Date.now },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", default: null },
    availability: { type: [AvailabilitySchema], default: [] },
  },
  { timestamps: true }
);

export default (models.Instructor as mongoose.Model<IInstructor>) ||
  model<IInstructor>("Instructor", InstructorSchema);
