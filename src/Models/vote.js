const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userID: { type: String, required: true },
  totalVotes: { type: Number, default: "0" }
});

module.exports = mongoose.model('userVote', userSchema);
