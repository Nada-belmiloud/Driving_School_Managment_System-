// project/models/Admin.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IAdmin {
  username: string;
  password: string;
  email: string;
}

const AdminSchema = new Schema<IAdmin>({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // hashed
  email: { type: String, required: true, unique: true, trim: true },
}, { timestamps: true });

export default (models.Admin as mongoose.Model<IAdmin>) || model<IAdmin>("Admin", AdminSchema);
