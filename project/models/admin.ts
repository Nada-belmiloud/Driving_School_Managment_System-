// project/models/Admin.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  password: string; // hashed
  email: string;
}

const emailRegex = /^\S+@\S+\.\S+$/;

const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, match: [emailRegex, "Invalid email"] },
  },
  { timestamps: true }
);

export default (models.Admin as mongoose.Model<IAdmin>) ||
  model<IAdmin>("Admin", AdminSchema);
