import { Schema, model } from "mongoose";

const userSchema = new Schema({
  userID: { type: String, required: true },
  totalVotes: { type: Number, default: "0" }
});

export default model('userVote', userSchema);
