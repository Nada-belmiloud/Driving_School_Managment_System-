// project/models/Exam.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IExam {
  courseId: mongoose.Types.ObjectId;
  examType: string;
  date: Date;
}

const ExamSchema = new Schema<IExam>({
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  examType: { type: String, required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

export default (models.Exam as mongoose.Model<IExam>) || model<IExam>("Exam", ExamSchema);
