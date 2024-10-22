import { Document } from "mongoose";
interface IUserVote extends Document {
    userID: string;
    totalVotes: number;
}
declare const _default: import("mongoose").Model<IUserVote, {}, {}, {}, Document<unknown, {}, IUserVote> & IUserVote & Required<{
    _id: unknown;
}> & {
    __v?: number;
}, any>;
export default _default;
