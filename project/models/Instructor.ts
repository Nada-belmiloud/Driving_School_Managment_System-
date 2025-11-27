import mongoose, { Schema, Document, models } from "mongoose";

export interface IInstructor extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  hireDate: Date;
  specialization?: string;
}

const InstructorSchema = new Schema<IInstructor>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    hireDate: { type: Date, default: Date.now },
    specialization: { type: String },
  },
  { timestamps: true }
);

export default models.Instructor ||
  mongoose.model<IInstructor>("Instructor", InstructorSchema);
