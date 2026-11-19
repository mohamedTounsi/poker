import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: string; // username
  senderAvatar?: string | null;
  channelType: "global" | "direct" | "game";
  recipient?: string | null; // username for direct message
  gameId?: string | null; // for game-specific chat
  content: string;
  deleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    sender: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    senderAvatar: {
      type: String,
      default: null,
    },
    channelType: {
      type: String,
      enum: ["global", "direct", "game"],
      default: "global",
      required: true,
    },
    recipient: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    gameId: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ channelType: 1, createdAt: 1 });
MessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });
MessageSchema.index({ gameId: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
