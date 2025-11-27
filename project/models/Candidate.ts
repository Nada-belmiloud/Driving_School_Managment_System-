import mongoose, { Schema, Document, models } from "mongoose";

export interface ICandidate extends Document {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  birthDate?: Date;
  address?: string;
  registrationDate: Date;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    birthDate: { type: Date },
    address: { type: String },
    registrationDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Candidate ||
  mongoose.model<ICandidate>("Candidate", CandidateSchema);
