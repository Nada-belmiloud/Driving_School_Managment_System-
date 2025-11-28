// project/models/Candidate.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ICandidate extends Document {
  name: string;
  phone: string;
  address: string;
  dateOfBirth: Date;
  registrationDate: Date;
  email: string;
  documents: {
    birthCertificate: string;
    residenceCertificate: string;
    medicalCertificate: string;
    photos: string[];
    nationalIdCopy: string;
    parentalAuthorization?: string | null;
  };
  progress: {
    crenoHours: number;
    codeHours: number;
    conduiteHours: number;
  };
}

const phoneRegex = /^\d{10}$/;
const emailRegex = /^\S+@\S+\.\S+$/;

const CandidateSchema = new Schema<ICandidate>(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [phoneRegex, "Phone must be 10 digits"],
    },
    address: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    registrationDate: { type: Date, default: Date.now },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [emailRegex, "Invalid email format"],
    },
    documents: {
      birthCertificate: { type: String, required: true },
      residenceCertificate: { type: String, required: true },
      medicalCertificate: { type: String, required: true },
      photos: { type: [String], default: [] },
      nationalIdCopy: { type: String, required: true },
      parentalAuthorization: { type: String, default: null },
    },
    progress: {
      crenoHours: { type: Number, default: 0 },
      codeHours: { type: Number, default: 0 },
      conduiteHours: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default (models.Candidate as mongoose.Model<ICandidate>) ||
  model<ICandidate>("Candidate", CandidateSchema);
