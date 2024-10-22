"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userVoteSchema = new mongoose_1.Schema({
    userID: { type: String, required: true, unique: true },
    totalVotes: { type: Number, default: 0 }
});
exports.default = (0, mongoose_1.model)('UserVote', userVoteSchema);
