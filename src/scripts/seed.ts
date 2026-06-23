import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "../config/db";
import { DB_NAME } from "../constants";
import { QuestionModel } from "../models/Question";
import { logInfo, logSuccess } from "../helpers/log";

/**
 * Jeu de questions géolocalisées de démonstration (quelques points d'intérêt
 * sur un trajet Paris → Lyon). Coordonnées au format GeoJSON [longitude, latitude].
 *
 * Lancement : `npm run seed`
 */
const questions = [
  {
    texte:
      "Quel monument parisien a été construit pour l'Exposition universelle de 1889 ?",
    choixReponses: ["La Tour Eiffel", "L'Arc de Triomphe", "Le Panthéon"],
    bonneReponse: "La Tour Eiffel",
    anecdote:
      "La Tour Eiffel devait être démontée après 20 ans ; elle a été sauvée par son utilité comme antenne radio.",
    localisation: { type: "Point" as const, coordinates: [2.2945, 48.8584] },
    rayonDeclenchement: 2000,
    publicCible: "tous" as const,
  },
  {
    texte:
      "Près de quelle ville se trouve le célèbre vignoble de Pouilly-Fuissé ?",
    choixReponses: ["Mâcon", "Dijon", "Auxerre"],
    bonneReponse: "Mâcon",
    anecdote:
      "Le Mâconnais est réputé pour ses vins blancs issus du cépage Chardonnay.",
    localisation: { type: "Point" as const, coordinates: [4.8357, 46.3069] },
    rayonDeclenchement: 5000,
    publicCible: "parent" as const,
  },
  {
    texte: "Quel animal est le symbole de la ville de Lyon ?",
    choixReponses: ["Le lion", "L'aigle", "Le loup"],
    bonneReponse: "Le lion",
    anecdote:
      "Le lion figure sur les armoiries de Lyon, en référence (populaire) au nom de la ville.",
    localisation: { type: "Point" as const, coordinates: [4.8357, 45.764] },
    rayonDeclenchement: 3000,
    publicCible: "enfant" as const,
  },
];

const run = async (): Promise<void> => {
  await connectDB(DB_NAME);

  logInfo("Suppression des anciennes questions...");
  await QuestionModel.deleteMany({});

  await QuestionModel.create(questions);
  logSuccess(`${questions.length} questions insérées.`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
