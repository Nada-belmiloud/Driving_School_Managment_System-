import mongoose, { Schema, Document, models } from "mongoose";

export interface ICourse extends Document {
  name: string;
  category: string;
  price: number;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true }, // A, B...
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

export default models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);
