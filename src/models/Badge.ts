import { Schema, model, InferSchemaType, type Types } from "mongoose";

const BadgeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export type BadgeType = InferSchemaType<typeof BadgeSchema> & {
  _id?: Types.ObjectId;
};

export default model<BadgeType>("Badge", BadgeSchema);
