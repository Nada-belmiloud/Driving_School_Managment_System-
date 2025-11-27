import mongoose, { Schema, Document, models } from "mongoose";

export interface ISession extends Document {
  candidate: mongoose.Types.ObjectId;
  instructor: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  date: Date;
  duration: number;
}

const SessionSchema = new Schema<ISession>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true }, // in hours
  },
  { timestamps: true }
);

export default models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
