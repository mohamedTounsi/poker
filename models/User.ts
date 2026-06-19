import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  password?: string;
  role: "admin" | "player";
  avatarUrl?: string;
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
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
    avatarUrl: {
      type: String,
      default: null,
    },
    medals: {
      gold: { type: Number, default: 0 },
      silver: { type: Number, default: 0 },
      bronze: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model query multiple times on hot-reloading
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
