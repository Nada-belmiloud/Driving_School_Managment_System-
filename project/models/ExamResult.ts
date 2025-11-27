import mongoose, { Schema, Document, models } from "mongoose";

export interface IExamResult extends Document {
  candidate: mongoose.Types.ObjectId;
  exam: mongoose.Types.ObjectId;
  passed: boolean;
}

const ExamResultSchema = new Schema<IExamResult>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
    exam: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    passed: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export default models.ExamResult ||
  mongoose.model<IExamResult>("ExamResult", ExamResultSchema);
