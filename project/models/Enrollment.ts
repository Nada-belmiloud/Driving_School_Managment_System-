// project/models/Enrollment.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IEnrollment {
  candidateId: mongoose.Types.ObjectId;
  planPayId?: mongoose.Types.ObjectId | null;
  licenseCategory: string;
  enrollmentDate?: Date;
  status?: string;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
  planPayId: { type: Schema.Types.ObjectId, ref: "PaymentPlan", default: null },
  licenseCategory: { type: String, required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, default: "active" },
}, { timestamps: true });

export default (models.Enrollment as mongoose.Model<IEnrollment>) || model<IEnrollment>("Enrollment", EnrollmentSchema);
