// project/models/PaymentPlan.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IPaymentPlan extends Document {
  name: string;
  numberOfInstallments: number;
  totalAmount: number;
}

const PaymentPlanSchema = new Schema<IPaymentPlan>(
  {
    name: { type: String, required: true },
    numberOfInstallments: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default (models.PaymentPlan as mongoose.Model<IPaymentPlan>) ||
  model<IPaymentPlan>("PaymentPlan", PaymentPlanSchema);
