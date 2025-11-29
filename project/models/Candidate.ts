// project/models/Candidate.ts
import mongoose, { Schema, model, models } from "mongoose";

export type Phase = {
  phase: "highway_code" | "parking" | "driving";
  status: "not_started" | "in_progress" | "completed";
  sessionsCompleted: number;
  sessionsPlanned: number;
};

export type DocChecklist = { name: string; checked: boolean };

export type EmbeddedPayment = {
  planId?: mongoose.Types.ObjectId | null;
  installmentNumber: number;
  amount: number;
  date: Date;
  method: string;
  status: "pending" | "completed" | "failed";
};

export interface ICandidate {
  name: string;
  id?: string; // frontend expects id string
  age?: number;
  dateOfBirth?: Date;
  licenseCategory?: string;
  documents: DocChecklist[];
  payments: EmbeddedPayment[];
  totalFee?: number;
  paidAmount?: number;
  phases: Phase[];
  instructorId?: mongoose.Types.ObjectId | null;
  status: "active" | "completed" | "inactive";
  sessionHistory: mongoose.Types.ObjectId[]; // reference ids to Session
  examHistory: mongoose.Types.ObjectId[]; // reference ids to ExamResult
  phone?: string;
  address?: string;
  email?: string;
}

const DocChecklistSchema = new Schema<DocChecklist>({
  name: { type: String, required: true },
  checked: { type: Boolean, default: false },
});

const PhaseSchema = new Schema<Phase>({
  phase: { type: String, required: true },
  status: { type: String, required: true },
  sessionsCompleted: { type: Number, default: 0 },
  sessionsPlanned: { type: Number, default: 0 },
});

const EmbeddedPaymentSchema = new Schema<EmbeddedPayment>({
  planId: { type: Schema.Types.ObjectId, ref: "PaymentPlan", default: null },
  installmentNumber: { type: Number, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, required: true },
  status: { type: String, default: "pending" },
});

const CandidateSchema = new Schema<ICandidate>({
  name: { type: String, required: true, trim: true },
  age: { type: Number, default: null },
  dateOfBirth: { type: Date, default: null },
  licenseCategory: { type: String, default: null },
  documents: { type: [DocChecklistSchema], default: [] },
  payments: { type: [EmbeddedPaymentSchema], default: [] },
  totalFee: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  phases: { type: [PhaseSchema], default: [] },
  instructorId: { type: Schema.Types.ObjectId, ref: "Instructor", default: null },
  status: { type: String, default: "active" },
  sessionHistory: [{ type: Schema.Types.ObjectId, ref: "Session" }],
  examHistory: [{ type: Schema.Types.ObjectId, ref: "ExamResult" }],
  phone: { type: String, default: null },
  address: { type: String, default: null },
  email: { type: String, default: null },
}, { timestamps: true });

// Optional: compute age from dateOfBirth before save (if dateOfBirth provided)
CandidateSchema.pre("save", function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const doc: any = this;
  if (doc.dateOfBirth && !doc.age) {
    const diffMs = Date.now() - new Date(doc.dateOfBirth).getTime();
    doc.age = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  }
  next();
});

export default (models.Candidate as mongoose.Model<ICandidate>) || model<ICandidate>("Candidate", CandidateSchema);
