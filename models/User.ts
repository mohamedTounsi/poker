import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  password?: string;
  role: "admin" | "player";
  avatarUrl?: string;
  bio?: string;
  themePreference?: "dark" | "light";
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
  createdAt: Date;
  updatedAt: Date;
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
    bio: {
      type: String,
      default: "",
      maxlength: 250,
    },
    themePreference: {
      type: String,
      enum: ["dark", "light"],
      default: "dark",
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

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
