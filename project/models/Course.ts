// project/models/Course.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface ICourse {
  type: string;
  title: string;
  duration: number;
  price: number;
}

const CourseSchema = new Schema<ICourse>({
  type: { type: String, required: true },
  title: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
}, { timestamps: true });

export default (models.Course as mongoose.Model<ICourse>) || model<ICourse>("Course", CourseSchema);

