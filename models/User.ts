import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  password?: string;
  role: "admin" | "player";
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "player"],
      default: "player",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model query multiple times on hot-reloading
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
