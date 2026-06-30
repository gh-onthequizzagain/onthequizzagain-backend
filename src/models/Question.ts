import { Schema, model, InferSchemaType, type Types } from "mongoose";

export enum QuestionMode {
  MultipleChoice = "multipleChoice",
  TrueFalse = "trueFalse",
}

export enum QuestionCategory {
  Geography = "geography",
  History = "history",
  Specialty = "specialty",
}

export enum TargetAudience {
  Parent = "parent",
  Child = "child",
  All = "all",
}

const AnswerSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const QuestionSchema = new Schema({
  type: {
    type: String,
    enum: ["multipleChoice", "trueFalse"],
    required: true,
  },
  question: { type: String, required: true },
  answers: { type: [AnswerSchema], required: true },
  solutionId: { type: String, required: true },
  funFact: { type: String },
  localisation: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: { type: [Number] },
  },
  triggerRadius: { type: Number },
  targetAudience: {
    type: String,
    enum: Object.values(TargetAudience),
  },
  locationTitle: { type: String },
  category: { type: String },
});

QuestionSchema.index({ localisation: "2dsphere" });

export type QuestionDocument = InferSchemaType<typeof QuestionSchema> & {
  _id: Types.ObjectId;
};

export default model<QuestionDocument>("Question", QuestionSchema, "questions");
