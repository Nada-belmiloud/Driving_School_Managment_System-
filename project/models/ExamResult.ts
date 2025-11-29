// project/models/ExamResult.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IExamResult {
  examId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  score: number;
  status: "pass" | "fail";
}

const ExamResultSchema = new Schema<IExamResult>({
  examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
  candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
  score: { type: Number, required: true },
  status: { type: String, required: true },
}, { timestamps: true });

export default (models.ExamResult as mongoose.Model<IExamResult>) || model<IExamResult>("ExamResult", ExamResultSchema);
