import axios from "axios";
import { HttpError } from "../middlewares/error";
import { logError } from "../helpers/log";
import type { AudienceType } from "../types/types";

export type QuestionType = "QCM" | "vraifaux";

export type IAQuestion = {
  poi: string;
  distanceKm: number;
  theme: string;
  audience: AudienceType;
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

const MODELS = [
  "poolside/laguna-m.1:free",
  "openrouter/owl-alpha",
  "liquid/lfm-2.5-1.2b-thinking:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "openai/gpt-oss-120b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "cohere/north-mini-code:free",
];

let modelIndex = 0;

const pickNextModel = (): string => {
  const model = MODELS[modelIndex]!;
  modelIndex = (modelIndex + 1) % MODELS.length;
  return model;
};

const AUDIENCE_PROFILES: Record<AudienceType, string> = {
  enfants: `
- Public : enfants de 8 à 13 ans
- Difficulté : FACILE — vocabulaire simple, question courte et directe
- Thèmes favoris : nature, animaux, gastronomie, sport, géographie simple, personnages célèbres accessibles
- INTERDIRE : sujets politiques, guerres, violence, thèmes morbides
- Distracteurs : clairement distincts de la bonne réponse, pas piégeux
- Anecdote : amusante, imagée, surprenante pour un enfant`,
  adolescents: `
- Public : adolescents de 14 à 17 ans
- Difficulté : INTERMÉDIAIRE — vocabulaire courant, peut inclure des références contemporaines
- Thèmes favoris : sport, sciences, culture générale, géographie, personnages célèbres, art
- Distracteurs : plausibles mais pas trop piégeux
- Anecdote : intéressante, peut inclure un aspect "insolite" ou "record"`,
  adultes: `
- Public : adultes (18 ans et plus)
- Difficulté : INTERMÉDIAIRE À ÉLEVÉE — vocabulaire sans restriction, questions précises
- Tous les thèmes disponibles
- Peut inclure : dates précises, étymologies, détails historiques, noms complets
- Distracteurs : crédibles et proches de la bonne réponse
- Anecdote : culturellement riche, peut faire référence à des faits peu connus`,
};

export const fetchIAQuestion = async (
  latitude: number,
  longitude: number,
  type: QuestionType,
  audience: AudienceType,
): Promise<IAQuestion> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new HttpError("Missing OPENROUTER_API_KEY", 500);

  const theme = pickRandomTheme();
  const themeDescription = THEMES[theme];
  const audienceProfile = AUDIENCE_PROFILES[audience];

  const prompt = `Tu es un concepteur expert de questions pour un jeu de culture générale de type Trivial Pursuit,
destiné à des passagers en voiture qui traversent une région.

## Contexte géographique
Coordonnées GPS du véhicule : ${latitude}, ${longitude}
Rayon STRICT : exactement 20 km autour de ces coordonnées. Ne dépasse JAMAIS ce périmètre.
Convertis ces coordonnées en région/département français pour identifier les communes proches.

## ⚠️ TYPE DE QUESTION — INSTRUCTION PRIORITAIRE
Le type imposé pour cette question est : **${type}**
Tu DOIS générer EXCLUSIVEMENT ce type. Ne génère PAS un QCM si le type est "vraifaux", et inversement.
- Si type = "QCM" → applique les règles QCM (4 choix réels, 1 bonne réponse mélangée parmi 3 distracteurs)
- Si type = "vraifaux" → applique les règles Vrai ou Faux (2 choix uniquement : "Vrai" et "Faux")

## Thème imposé pour cette question
Thème obligatoire : **${theme}**
Définition du thème : ${themeDescription}
Tu DOIS générer une question relevant de ce thème précis.
INTERDIT de basculer sur le thème "histoire" sauf si le fait historique est le cœur de ce thème.

## Processus interne (ne pas inclure dans la réponse JSON)
Étape 1 — Identifie la commune ou le lieu principal le plus proche des coordonnées (dans les 20 km).
Étape 2 — Trouve un fait précis et vérifiable relevant du thème imposé, lié à ce lieu.
Étape 3 — Vérifie mentalement ce fait sur Wikipédia (fr.wikipedia.org), wikidata (https://www.wikidata.org/wiki/Wikidata:Main_Page?uselang=fr) ou la page officielle du lieu.
Étape 4 — Si ta confiance est inférieure à 85 %, choisis un autre sujet dans le rayon de 20 km.
Étape 5 — Génère la question uniquement si tu peux citer une source réelle.

## Adaptation au public
${audienceProfile}

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
- Langue : français

## Règles pour les choix des questions type QCM.
- 4 choix au total : 1 bonne réponse + 3 distracteurs plausibles
- Les distracteurs DOIVENT être des éléments RÉELS (vrais noms, vraies dates, vrais lieux) — jamais inventés
- Les distracteurs doivent être crédibles : même époque, même catégorie, même région
- Mélange aléatoirement la position de la bonne réponse dans le tableau choices

## Règles pour les types de question Vrai ou Faux.
- Proposer une question qui n'attend comme réponse QUE 2 CHOIX VRAI OU FAUX et rien d'autre.
- Exemple de questions pour les vrais ou faux :
    ✅ sport      : "Le club de l'AJ Auxerre a déjà remporté la ligue des champions ?" -> Faux
    ✅ gastronomie: "Les rillettes de Tours sont faites à base poulet ?" -> Faux
    ✅ art        : "Leonard de Vinci a peint la Joconde ?" -> Vrai
    ✅ géographie : "Marseille est dans le département du Gard ?" -> Faux
    ✅ sciences   : " Dans la formule E=mc2, c représente la vitesse de la lumière.?" -> Vrai

## Format de réponse
Réponds UNIQUEMENT avec ce JSON, sans texte avant ni après, sans balises markdown.

${
  type === "QCM"
    ? `Le type est QCM → choices doit contenir EXACTEMENT 4 éléments réels :
{
  "poi": "Nom exact du lieu ou sujet de la question",
  "distanceKm": 12,
  "theme": "${theme}",
  "audience": "${audience}",
  "type": "QCM",
  "question": "...",
  "choices": ["choix A", "choix B", "choix C", "choix D"],
  "answer": "la bonne réponse (identique à l'un des 4 choix)",
  "anecdote": "...",
  "source": "https://fr.wikipedia.org/wiki/...",
  "confidence": 92
}`
    : `Le type est vraifaux → choices doit contenir EXACTEMENT 2 éléments ["Vrai", "Faux"] et rien d'autre :
{
  "poi": "Nom exact du lieu ou sujet de la question",
  "distanceKm": 12,
  "theme": "${theme}",
  "audience": "${audience}",
  "type": "vraifaux",
  "question": "...",
  "choices": ["Vrai", "Faux"],
  "answer": "Vrai ou Faux (un seul mot, identique à l'un des 2 choix)",
  "anecdote": "...",
  "source": "https://fr.wikipedia.org/wiki/...",
  "confidence": 92
}`
}

## Détail des champs
- poi : commune ou lieu précis dans le rayon de 20 km
- distanceKm : distance approximative en km (doit être ≤ 20)
- theme : "${theme}" (valeur fixe, ne pas modifier)
- audience : "${audience}" (valeur fixe, ne pas modifier)
- type : "${type}" (valeur fixe, ne pas modifier)
- question : la question posée au joueur
- choices : ${type === "QCM" ? "tableau de 4 réponses RÉELLES, la bonne réponse mélangée parmi les autres" : 'tableau de 2 éléments UNIQUEMENT : ["Vrai", "Faux"]'}
- answer : ${type === "QCM" ? "la bonne réponse (doit correspondre exactement à l'un des éléments de choices)" : '"Vrai" ou "Faux" (doit correspondre exactement à l\'un des 2 éléments de choices)'}
- anecdote : 2-3 phrases surprenantes sur le sujet, différentes de la question, à afficher après la réponse
- source : URL Wikipédia (fr.wikipedia.org), wikidata (https://www.wikidata.org/wiki/Wikidata:Main_Page?uselang=fr) ou page officielle ayant permis de vérifier le fait
- confidence : ton niveau de certitude sur la réponse correcte, entre 0 et 100`;

  const tryModels = async () => {
    let lastErr: unknown;
    for (let i = 0; i < MODELS.length; i++) {
      const model = pickNextModel();
      try {
        return await axios.post<OpenRouterResponse>(
          "https://openrouter.ai/api/v1/chat/completions",
          { model, messages: [{ role: "user", content: prompt }] },
          { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } },
        );
      } catch (err) {
        if (axios.isAxiosError(err)) {
          lastErr = err;
          logError(`Model ${model} failed (${String(err.response?.status ?? "network error")}), trying next`);
          continue;
        }
        throw err;
      }
    }
    if (axios.isAxiosError(lastErr) && lastErr.response?.status === 429) {
      throw new HttpError("All AI models are rate limited, please try again later", 429);
    }
    throw new HttpError("All AI models failed, please try again later", 503);
  };

  const response = await tryModels();

  const content = response.data.choices[0]?.message.content;
  if (!content) throw new HttpError("Empty response from AI", 502);

  try {
    const question = JSON.parse(content) as IAQuestion;
    return question;
  } catch {
    throw new HttpError("Failed to parse AI response", 502);
  }
};
