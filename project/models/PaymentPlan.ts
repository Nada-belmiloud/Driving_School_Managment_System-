import mongoose, { Schema, Document, models } from "mongoose";

export interface IPaymentPlan extends Document {
  course: mongoose.Types.ObjectId;
  totalAmount: number;
  numberOfPayments: number;
}

const PaymentPlanSchema = new Schema<IPaymentPlan>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    totalAmount: { type: Number, required: true },
    numberOfPayments: { type: Number, required: true },
  },
  { timestamps: true }
);

export default models.PaymentPlan ||
  mongoose.model<IPaymentPlan>("PaymentPlan", PaymentPlanSchema);
