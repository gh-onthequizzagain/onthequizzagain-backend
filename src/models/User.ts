import { Schema, model, InferSchemaType, type Types } from "mongoose";

const EarnedBadgeSchema = new Schema(
  {
    badge: { type: Schema.Types.ObjectId, ref: "Badge", required: true },
    value: { type: Number, default: 0 },
    earnedAt: { type: Date, default: null }, // null = pas encore gagné
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    username: {
      type: String,
      required: true,
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
    badges: {
      type: [EarnedBadgeSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export type UserType = InferSchemaType<typeof UserSchema> & {
  _id?: Types.ObjectId;
};

export default model<UserType>("User", UserSchema);
