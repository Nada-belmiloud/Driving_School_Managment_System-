// project/models/Payment.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IPayment extends Document {
  candidateId: mongoose.Types.ObjectId;
  planPayId: mongoose.Types.ObjectId;
  installmentNumber: number;
  amount: number;
  date: Date;
  method: string;
  status: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
    planPayId: { type: Schema.Types.ObjectId, ref: "PaymentPlan", required: true },
    installmentNumber: { type: Number, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default (models.Payment as mongoose.Model<IPayment>) ||
  model<IPayment>("Payment", PaymentSchema);
