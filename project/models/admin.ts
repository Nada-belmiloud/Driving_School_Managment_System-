import mongoose, { Schema, Document, models } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  password: string;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Admin ||
  mongoose.model<IAdmin>("Admin", AdminSchema);
