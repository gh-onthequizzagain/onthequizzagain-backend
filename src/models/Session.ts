import { Schema, model, InferSchemaType, type Types } from "mongoose";

export enum GameScreen {
  Preparation = "preparation",
  InGame = "inGame",
  Finish = "finish",
}

export enum FrequencyType {
  Distance = "distance",
  Time = "time",
}

export enum GameDifficulty {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
}

export enum QuestionMode {
  MultipleChoice = "multipleChoice",
  TrueFalse = "trueFalse",
}

export enum QuestionStatus {
  Pending = "pending",
  CorrectlyFound = "correctlyFound",
  IncorrectlyFound = "incorrectlyFound",
}

const SessionQuestionSchema = new Schema(
  {
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    playerName: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(QuestionStatus),
      default: QuestionStatus.Pending,
    },
  },
  { _id: false }
);

const PlayerSchema = new Schema(
  {
    name: { type: String, required: true },
    isMainUser: { type: Boolean, default: false },
  },
  { _id: false }
);

const FrequencySchema = new Schema(
  {
    type: { type: String, enum: Object.values(FrequencyType), required: true },
    value: { type: Number, required: true },
  },
  { _id: false }
);

const SessionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    players: { type: [PlayerSchema], default: [] },
    screen: {
      type: String,
      enum: Object.values(GameScreen),
      default: GameScreen.Preparation,
    },
    stepIndex: { type: Number, default: 1 },
    title: { type: String, default: "" },
    frequency: {
      type: FrequencySchema,
      default: () => ({ type: FrequencyType.Time, value: 300 }),
    },
    difficulty: {
      type: String,
      enum: Object.values(GameDifficulty),
      default: GameDifficulty.Medium,
    },
    questionModes: {
      type: [{ type: String, enum: Object.values(QuestionMode) }],
      default: () => [QuestionMode.MultipleChoice, QuestionMode.TrueFalse],
    },
    hasNotification: { type: Boolean, default: true },
    totalQuestions: { type: Number, default: 25 },
    questions: { type: [SessionQuestionSchema], default: [] },
  },
  { timestamps: true }
);

export type SessionType = InferSchemaType<typeof SessionSchema> & {
  _id?: Types.ObjectId;
};

export default model<SessionType>("Session", SessionSchema);
