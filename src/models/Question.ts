import { Schema, model, InferSchemaType, type Types } from "mongoose";

export enum QuestionMode {
  MultipleChoice = "multipleChoice",
  TrueFalse = "trueFalse",
}

const AnswerSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const LocationSchema = new Schema(
  {
    lon: { type: Number, required: true },
    lat: { type: Number, required: true },
  },
  { _id: false }
);

const QuestionSchema = new Schema(
  {
    photo: { type: String, required: true },
    locationTitle: { type: String, required: true },
    locationDistance: { type: Number, required: true },
    question: { type: String, required: true },
    answers: { type: [AnswerSchema], default: [] },
    solutionId: { type: String, required: true },
    type: { type: String, enum: Object.values(QuestionMode), required: true },
    coordinate: { type: LocationSchema, required: true },
  },
  { timestamps: true }
);

export type QuestionType = InferSchemaType<typeof QuestionSchema> & {
  _id?: Types.ObjectId;
};

export default model<QuestionType>("Question", QuestionSchema);
