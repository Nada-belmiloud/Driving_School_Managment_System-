import mongoose, { Schema, Document, models } from "mongoose";

export interface IPayment extends Document {
  enrollment: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    enrollment: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
