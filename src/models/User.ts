import { Schema, model, InferSchemaType, type Types } from "mongoose";

const UserSchema = new Schema(
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

export type UserType = InferSchemaType<typeof UserSchema> & { _id?: Types.ObjectId };

export default model<UserType>("User", UserSchema);
