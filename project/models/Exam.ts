// project/models/Exam.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IExam extends Document {
  courseId: mongoose.Types.ObjectId;
  examType: string;
  date: Date;
  instructorId?: mongoose.Types.ObjectId | null;
}

const ExamSchema = new Schema<IExam>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    examType: { type: String, required: true },
    date: { type: Date, required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: "Instructor", default: null },
  },
  { timestamps: true }
);

export default (models.Exam as mongoose.Model<IExam>) ||
  model<IExam>("Exam", ExamSchema);
