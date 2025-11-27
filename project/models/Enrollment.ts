import mongoose, { Schema, Document, models } from "mongoose";

export interface IEnrollment extends Document {
  candidate: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  status: string;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export default models.Enrollment ||
  mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);
