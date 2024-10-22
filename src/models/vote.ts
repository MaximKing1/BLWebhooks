import { Schema, model, Document } from "mongoose";

interface IUserVote extends Document {
  userID: string;
  totalVotes: number;
}

const userVoteSchema = new Schema<IUserVote>({
  userID: { type: String, required: true, unique: true },
  totalVotes: { type: Number, default: 0 }
});

export default model<IUserVote>('UserVote', userVoteSchema);
