import mongoose, { Schema, Document, models } from "mongoose";

export interface IExam extends Document {
  type: string; // code / conduite
  date: Date;
  instructor: mongoose.Types.ObjectId;
}

const ExamSchema = new Schema<IExam>(
  {
    type: { type: String, required: true },
    date: { type: Date, required: true },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Exam || mongoose.model<IExam>("Exam", ExamSchema);
