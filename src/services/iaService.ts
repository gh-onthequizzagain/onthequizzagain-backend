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
  source: string;
  confidence: number;
};

type OpenRouterResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
};

const THEMES: Record<string, string> = {
  géographie:
    "reliefs, fleuves, lacs, frontières, records géographiques locaux",
  art: "peintres, sculpteurs, architectes, œuvres d'art, musées de la région",
  littérature:
    "auteurs nés ou ayant vécu ici, œuvres inspirées du lieu, maisons d'écrivains",
  gastronomie:
    "spécialités culinaires, AOC/AOP, vignobles, fromages, recettes locales",
  sciences:
    "inventeurs, découvertes scientifiques, sites industriels historiques, naturel remarquable",
  patrimoine:
    "châteaux, abbayes, monuments classés, sites UNESCO, architecture remarquable",
  sport:
    "clubs sportifs locaux, sportifs célèbres nés ici, compétitions historiques, records sportifs",
  "culture générale":
    "faits insolites, records, anecdotes surprenantes, curiosités locales",
  "personnages célèbres":
    "rois, reines, généraux, artistes, scientifiques, politiques liés au lieu",
};

const pickRandomTheme = (): string => {
  const keys = Object.keys(THEMES);
  return keys[Math.floor(Math.random() * keys.length)] as string;
};

export const fetchIAQuestion = async (
  latitude: number,
  longitude: number,
): Promise<IAQuestion> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new HttpError("Missing OPENROUTER_API_KEY", 500);

  const theme = pickRandomTheme();
  const themeDescription = THEMES[theme];

  const prompt = `Tu es un concepteur expert de questions pour un jeu de culture générale de type Trivial Pursuit,
destiné à des passagers en voiture qui traversent une région.

## Contexte géographique
Coordonnées GPS du véhicule : ${latitude}, ${longitude}
Rayon STRICT : exactement 20 km autour de ces coordonnées. Ne dépasse JAMAIS ce périmètre.
Convertis ces coordonnées en région/département français pour identifier les communes proches.

## Thème imposé pour cette question
Thème obligatoire : **${theme}**
Définition du thème : ${themeDescription}
Tu DOIS générer une question relevant de ce thème précis.
INTERDIT de basculer sur le thème "histoire" sauf si le fait historique est le cœur de ce thème.

## Processus interne (ne pas inclure dans la réponse JSON)
Étape 1 — Identifie la commune ou le lieu principal le plus proche des coordonnées (dans les 20 km).
Étape 2 — Trouve un fait précis et vérifiable relevant du thème imposé, lié à ce lieu.
Étape 3 — Vérifie mentalement ce fait sur Wikipédia (fr.wikipedia.org) ou la page officielle du lieu.
Étape 4 — Si ta confiance est inférieure à 85 %, choisis un autre sujet dans le rayon de 20 km.
Étape 5 — Génère la question uniquement si tu peux citer une source réelle.

## Règles de contenu
- La question NE DOIT PAS être "Quel lieu se trouve à X km de ces coordonnées ?"
- NE PAS écrire "situé à X km d'ici" — utiliser à la place le nom réel du lieu
- Porter sur UN FAIT précis : date, personnage, record, événement, caractéristique unique
- Exemples selon le thème imposé :
    ✅ sport      : "Quel club de football a été fondé à X en 1923 ?"
    ✅ gastronomie: "Quelle AOC viticole est produite autour de X ?"
    ✅ art        : "Quel peintre impressionniste est né à X ?"
    ✅ géographie : "Quel est le point culminant du massif de X ?"
    ✅ sciences   : "Quelle invention fut brevetée à X par quel ingénieur ?"
- Difficulté : intermédiaire (ni trop facile, ni encyclopédique)
- Langue : français

## Règles pour les choix
- 4 choix au total : 1 bonne réponse + 3 distracteurs plausibles
- Les distracteurs DOIVENT être des éléments RÉELS (vrais noms, vraies dates, vrais lieux) — jamais inventés
- Les distracteurs doivent être crédibles : même époque, même catégorie, même région
- Mélange aléatoirement la position de la bonne réponse dans le tableau choices

## Format de réponse
Réponds UNIQUEMENT avec ce JSON, sans texte avant ni après, sans balises markdown :
{
  "poi": "Nom exact du lieu ou sujet de la question",
  "distanceKm": 12,
  "theme": "${theme}",
  "question": "...",
  "choices": ["...", "...", "...", "..."],
  "answer": "...",
  "anecdote": "...",
  "source": "https://fr.wikipedia.org/wiki/...",
  "confidence": 92
}

## Détail des champs
- poi : commune ou lieu précis dans le rayon de 20 km
- distanceKm : distance approximative en km (doit être ≤ 20)
- theme : "${theme}" (valeur fixe, ne pas modifier)
- question : la question posée au joueur
- choices : tableau de 4 réponses RÉELLES, la bonne réponse mélangée parmi les autres
- answer : la bonne réponse (doit correspondre exactement à l'un des éléments de choices)
- anecdote : 2-3 phrases surprenantes sur le sujet, différentes de la question, à afficher après la réponse
- source : URL Wikipédia (fr.wikipedia.org) ou page officielle ayant permis de vérifier le fait
- confidence : ton niveau de certitude sur la réponse correcte, entre 0 et 100`;

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
