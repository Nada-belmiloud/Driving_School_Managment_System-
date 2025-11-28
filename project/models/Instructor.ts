// project/models/Instructor.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IInstructor {
  name: string;
  phone?: string;
  email?: string;
  specialization?: string;
  hireDate?: Date;
  workingHours?: string;   // frontend expects this
  maxStudents?: number;
  currentStudents?: number;
  availability?: { date: Date; startTime?: string; endTime?: string }[];
  vehicleId?: mongoose.Types.ObjectId | null;
}

const AvailabilitySchema = new Schema({
  date: { type: Date, required: true },
  startTime: { type: String, default: null },
  endTime: { type: String, default: null },
});

const InstructorSchema = new Schema<IInstructor>({
  name: { type: String, required: true },
  phone: { type: String, default: null },
  email: { type: String, default: null },
  specialization: { type: String, default: null },
  hireDate: { type: Date, default: Date.now },
  workingHours: { type: String, default: "09:00-17:00" },
  maxStudents: { type: Number, default: 10 },
  currentStudents: { type: Number, default: 0 },
  availability: { type: [AvailabilitySchema], default: [] },
  vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", default: null },
}, { timestamps: true });

export default (models.Instructor as mongoose.Model<IInstructor>) || model<IInstructor>("Instructor", InstructorSchema);
