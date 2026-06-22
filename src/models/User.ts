import { Schema, model, type Document, type Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  account: {
    username: string;
  };
  token: string;
  salt: string;
  hash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    account: {
      username: {
        type: String,
        required: true,
      },
    },
    token: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default model<IUser>("User", UserSchema);
