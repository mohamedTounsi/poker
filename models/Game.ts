import mongoose, { Schema, Document } from "mongoose";

export interface IGamePlayer {
  userId: mongoose.Types.ObjectId;
  username: string;
  score: number; // In TND, can be positive or negative
  rebuys?: number; // Number of rebuys in this game session
  rebuyTotal?: number; // Total amount rebought in TND
}

export interface IGameTransaction {
  fromUser: string; // Username of lender/source
  toUser: string;   // Username of borrower/destination
  amount: number;   // Amount in TND
  type?: "transfer" | "rebuy" | "adjustment";
  timestamp: Date;
}

export interface IGameAction {
  id: string;
  type: "score" | "rebuy" | "transfer" | "decrease_all";
  description: string;
  timestamp: Date;
  stateSnapshot?: {
    players: Array<{ userId: string; username: string; score: number; rebuys?: number }>;
  };
}

export interface IGame extends Document {
  status: "active" | "completed";
  date: Date;
  players: IGamePlayer[];
  transactions: IGameTransaction[];
  actions?: IGameAction[];
  notes?: string;
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
  rebuys: {
    type: Number,
    default: 0,
  },
  rebuyTotal: {
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
  type: {
    type: String,
    enum: ["transfer", "rebuy", "adjustment"],
    default: "transfer",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const GameActionSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  stateSnapshot: {
    type: Schema.Types.Mixed,
    default: null,
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
    actions: [GameActionSchema],
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Game || mongoose.model<IGame>("Game", GameSchema);
