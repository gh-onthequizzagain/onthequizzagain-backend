import axios from "axios";
import { HttpError } from "../middlewares/error";

export type IAQuestion = {
  poi: string;
  distanceKm: number;
  theme: string;
  question: string;
  choices: string[];
  answer: string;
  anecdote: string;
};

type OpenRouterResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
};

export const fetchIAQuestion = async (
  latitude: number,
  longitude: number,
): Promise<IAQuestion> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new HttpError("Missing OPENROUTER_API_KEY", 500);

  const prompt = `Tu es un concepteur expert de questions pour un jeu de culture générale de type Trivial Pursuit,
destiné à des passagers en voiture qui traversent une région.

## Contexte géographique
Coordonnées GPS du véhicule : ${latitude}, ${longitude}
Rayon de recherche : 20 km autour de ces coordonnées.

## Ta mission
Identifie un lieu, événement, personnage ou fait remarquable dans ce rayon, 
puis génère UNE question QCM sur ce sujet.

## Règles de contenu
- La question NE DOIT PAS être "Quel lieu se trouve à X km de ces coordonnées ?"
- NE PAS ECRIRE dans la question "située à X Km de ici". Convenable "A proximité de votre trajet"
- Elle doit porter sur UN FAIT lié à ce lieu : date, personnage, événement historique, 
  caractéristique remarquable, anecdote scientifique ou culturelle
- Exemples de formulations acceptables :
    ✅ "En quelle année fut fondée l'abbaye de X, visible depuis la route ?"
    ✅ "Quel roi de France séjourna au château de X lors de la guerre de Cent Ans ?"
    ✅ "Quelle spécialité culinaire est originaire de la ville de X, à 12 km d'ici ?"
    ✅ "Quel célèbre écrivain naquit à X, ville traversée par la rivière Y ?"
- Thèmes possibles (varier à chaque appel) : histoire, géographie, art, littérature, 
  gastronomie, sciences, patrimoine, personnages célèbres, faits-divers historiques
- Difficulté : intermédiaire (ni trop facile, ni encyclopédique)
- Langue : français

## Règles pour les choix
- 4 choix au total : 1 bonne réponse + 3 distracteurs plausibles
- Les distracteurs doivent être crédibles (même époque, même catégorie, même région)
- Éviter les distracteurs fantaisistes ou trop facilement éliminables

## Règles de fiabilité
- Ne génère la question QUE si tu es certain à plus de 90% de la réponse correcte
- Si tu n'es pas certain, choisis un autre sujet dans le rayon des 20 km
- Mélange aléatoirement la position de la bonne réponse dans le tableau choices

## Format de réponse
Réponds UNIQUEMENT avec ce JSON, sans texte avant ni après, sans balises markdown :
{
  "poi": "Nom du lieu ou sujet de la question",
  "distanceKm": 12,
  "theme": "histoire",
  "question": "...",
  "choices": ["...", "...", "...", "..."],
  "answer": "...",
  "anecdote": "..."
}

## Détail des champs
- poi : le lieu ou sujet qui a inspiré la question
- distanceKm : distance approximative en km depuis les coordonnées fournies
- theme : un seul mot parmi histoire / géographie / art / littérature / gastronomie / sciences / patrimoine
- question : la question posée au joueur
- choices : tableau de 4 réponses, la bonne réponse mélangée parmi les autres
- answer : la bonne réponse (doit correspondre exactement à l'un des éléments de choices)
- anecdote : 2-3 phrases surprenantes sur le sujet, différentes de la question, 
  à afficher après la réponse`;

  const response = await axios.post<OpenRouterResponse>(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-oss-120b:free",
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  const content = response.data.choices[0]?.message.content;
  if (!content) throw new HttpError("Empty response from AI", 502);

  try {
    const question = JSON.parse(content) as IAQuestion;
    return question;
  } catch {
    throw new HttpError("Failed to parse AI response", 502);
  }
};
