import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";

/**
 * Une réponse donnée par le joueur à une question pendant une partie.
 * `correct` est calculée côté serveur (le client n'a jamais la bonne réponse).
 */
const reponseSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    responseGiven: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false },
);

/**
 * Collection `sessions` (cf. spec 10.1) : une partie de quiz lancée par un
 * utilisateur sur un trajet donné.
 */
const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    routeName: { type: String, default: "" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    answeredQuestions: { type: [reponseSchema], default: [] },
    totalScore: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type Session = InferSchemaType<typeof sessionSchema>;
export type SessionDocument = HydratedDocument<Session>;

export const SessionModel = model("Session", sessionSchema);
