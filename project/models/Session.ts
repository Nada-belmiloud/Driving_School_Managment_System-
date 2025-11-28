// project/models/Session.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ISession extends Document {
  candidateId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId | null;
  sessionType: string; // 'creno' | 'code' | 'conduite'
  date: Date;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
}

const SessionSchema = new Schema<ISession>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: "Instructor", required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", default: null },
    sessionType: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, default: "scheduled" },
  },
  { timestamps: true }
);

export default (models.Session as mongoose.Model<ISession>) ||
  model<ISession>("Session", SessionSchema);
