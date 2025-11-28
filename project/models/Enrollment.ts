// project/models/Enrollment.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IEnrollment extends Document {
  candidateId: mongoose.Types.ObjectId;
  planPayId: mongoose.Types.ObjectId;
  licenseCategory: string;
  enrollmentDate: Date;
  status: string;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
    planPayId: { type: Schema.Types.ObjectId, ref: "PaymentPlan", required: true },
    licenseCategory: { type: String, required: true },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export default (models.Enrollment as mongoose.Model<IEnrollment>) ||
  model<IEnrollment>("Enrollment", EnrollmentSchema);
