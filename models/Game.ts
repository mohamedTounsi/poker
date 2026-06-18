import mongoose, { Schema, Document } from "mongoose";

export interface IGamePlayer {
  userId: mongoose.Types.ObjectId;
  username: string;
  score: number; // In TND, can be positive or negative
}

export interface IGameTransaction {
  fromUser: string; // Username of lender (gets +score)
  toUser: string;   // Username of borrower (gets -score)
  amount: number;   // Amount borrowed in TND
  timestamp: Date;
}

export interface IGame extends Document {
  status: "active" | "completed";
  date: Date;
  players: IGamePlayer[];
  transactions: IGameTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const GamePlayerSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
});

const GameTransactionSchema = new Schema({
  fromUser: {
    type: String,
    required: true,
  },
  toUser: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const GameSchema: Schema = new Schema(
  {
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    players: [GamePlayerSchema],
    transactions: [GameTransactionSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Game || mongoose.model<IGame>("Game", GameSchema);
