import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";

/**
 * Sous-document GeoJSON `Point` ([longitude, latitude]).
 * C'est ce format qu'attend l'index géospatial `2dsphere` de MongoDB.
 */
const pointSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    // ⚠️ ordre GeoJSON : [longitude, latitude]
    coordinates: { type: [Number], required: true },
  },
  { _id: false },
);

/**
 * Collection `questions` (cf. spec 10.1).
 * Chaque question est rattachée à un point d'intérêt géographique et n'est
 * déclenchée que lorsque l'utilisateur entre dans son `rayonDeclenchement`.
 */
const questionSchema = new Schema({
  texte: { type: String, required: true, trim: true },
  choixReponses: { type: [String], required: true },
  bonneReponse: { type: String, required: true },
  anecdote: { type: String, default: "" },
  localisation: { type: pointSchema, required: true },
  // rayon (en mètres) autour du point dans lequel la question se déclenche
  rayonDeclenchement: { type: Number, required: true, default: 500 },
  publicCible: {
    type: String,
    enum: ["parent", "enfant", "tous"],
    default: "tous",
  },
});

// Index géospatial nécessaire aux requêtes de proximité ($geoNear / $near).
questionSchema.index({ localisation: "2dsphere" });

export type Question = InferSchemaType<typeof questionSchema>;
export type QuestionDocument = HydratedDocument<Question>;

export const QuestionModel = model("Question", questionSchema);
