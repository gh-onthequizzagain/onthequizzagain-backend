import type { HydratedDocument } from "mongoose";
import Badge from "../models/Badge";
import Session, { GameScreen, QuestionStatus } from "../models/Session";
import User, { type UserType } from "../models/User";
import { HttpError } from "../middlewares/error";
import { logSuccess } from "../helpers/log";

type UserDoc = HydratedDocument<UserType>;

const EARLY_HOUR = 8;

/** Compte les sessions terminées par l'utilisateur (screen === finish). */
const countFinishedSessions = async (user: UserDoc): Promise<number> => {
  return Session.countDocuments({ user: user._id, screen: GameScreen.Finish });
};

// --- Une fonction de progression par badge (retourne un nombre) ---

/** first_trip : 1 si au moins une session terminée, sinon 0. */
export const progressFirstTrip = async (user: UserDoc): Promise<number> => {
  const finished = await countFinishedSessions(user);
  return finished >= 1 ? 1 : 0;
};

/** streak_5 : meilleure série de bonnes réponses d'affilée (toutes sessions). */
export const progressStreak5 = async (user: UserDoc): Promise<number> => {
  const sessions = await Session.find({ user: user._id });

  let best = 0;
  for (const session of sessions) {
    let streak = 0;
    for (const q of session.questions) {
      if (q.status === QuestionStatus.CorrectlyFound) {
        streak += 1;
        if (streak > best) best = streak;
      } else {
        streak = 0;
      }
    }
  }
  return best;
};

/** correct_100 : total de bonnes réponses cumulées sur toutes les sessions. */
export const progressCorrect100 = async (user: UserDoc): Promise<number> => {
  const sessions = await Session.find({ user: user._id });

  return sessions.reduce((total, session) => {
    return (
      total +
      session.questions.filter(
        (q) => q.status === QuestionStatus.CorrectlyFound,
      ).length
    );
  }, 0);
};

/** roadtripper : nombre de sessions terminées. */
export const progressRoadtripper = async (user: UserDoc): Promise<number> => {
  return countFinishedSessions(user);
};

// Nombre minimum de questions pour valider un sans-faute "champion".
const CHAMPION_MIN_QUESTIONS = 25;

/** champion : 1 si une session sans-faute d'au moins 25 questions, sinon 0. */
export const progressChampion = async (user: UserDoc): Promise<number> => {
  const sessions = await Session.find({
    user: user._id,
    screen: GameScreen.Finish,
  });

  const hasPerfect = sessions.some((session) => {
    if (session.questions.length < CHAMPION_MIN_QUESTIONS) return false;
    return session.questions.every(
      (q) => q.status === QuestionStatus.CorrectlyFound,
    );
  });

  return hasPerfect ? 1 : 0;
};

/** early_bird : 1 si une session terminée avant 8h (heure serveur), sinon 0. */
export const progressEarlyBird = async (user: UserDoc): Promise<number> => {
  const sessions = await Session.find({
    user: user._id,
    screen: GameScreen.Finish,
  });

  const hasEarly = sessions.some((session) => {
    const finishedAt = session.get("updatedAt") as Date | undefined;
    return finishedAt !== undefined && finishedAt.getHours() < EARLY_HOUR;
  });

  return hasEarly ? 1 : 0;
};

// Associe chaque code de badge à sa fonction de progression.
const PROGRESS: Record<string, (user: UserDoc) => Promise<number>> = {
  first_trip: progressFirstTrip,
  streak_5: progressStreak5,
  correct_100: progressCorrect100,
  roadtripper: progressRoadtripper,
  champion: progressChampion,
  early_bird: progressEarlyBird,
};

/**
 * Évalue tous les badges du catalogue.
 * Pour chacun : calcule la progression, met à jour `value` (plafonnée à la
 * cible = `badge.value`), et pose `earnedAt` la première fois que la cible est
 * atteinte. Sauvegarde une seule fois. Retourne le nombre de badges gagnés.
 */
export const evaluateAllBadges = async (user: UserDoc): Promise<number> => {
  const catalog = await Badge.find();
  let awarded = 0;

  for (const badge of catalog) {
    const progressFn = PROGRESS[badge.code];
    if (!progressFn) continue;

    // Entrée de l'utilisateur pour ce badge (créée si absente).
    let entry = user.badges.find(
      (e) => e.badge?.toString() === badge._id.toString(),
    );
    if (!entry) {
      user.badges.push({ badge: badge._id, value: 0, earnedAt: null });
      entry = user.badges[user.badges.length - 1];
    }
    if (!entry) continue;

    // Déjà gagné : on ne touche plus.
    if (entry.earnedAt) continue;

    const target = badge.value;
    const progress = await progressFn(user);

    entry.value = Math.min(progress, target);

    if (progress >= target) {
      entry.earnedAt = new Date();
      awarded += 1;
      logSuccess(`Badge "${badge.code}" awarded to user ${user._id?.toString()}`);
    }
  }

  if (user.isModified("badges")) await user.save();

  return awarded;
};

/** Formate une date en "12/12/2024 à 15h30". */
const formatDate = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} à ${pad(date.getHours())}h${pad(date.getMinutes())}`;
};

/**
 * Liste tout le catalogue de badges avec, pour l'utilisateur donné :
 * - `earned` : true/false s'il l'a gagné
 * - `earnedAt` : date formatée "12/12/2024 à 15h30", ou "" si pas gagné
 */
export const listBadges = async (token: string) => {
  const user = await User.findOne({ token });
  if (!user) throw new HttpError("Unauthorized", 401);

  // Map badgeId -> date d'obtention et progression de l'utilisateur.
  const earnedMap = new Map<string, Date>();
  const valueMap = new Map<string, number>();
  for (const entry of user.badges) {
    if (!entry.badge) continue;
    valueMap.set(entry.badge.toString(), entry.value ?? 0);
    if (entry.earnedAt) earnedMap.set(entry.badge.toString(), entry.earnedAt);
  }

  const catalog = await Badge.find();

  return catalog.map((badge) => {
    const earnedAt = earnedMap.get(badge._id.toString());
    return {
      _id: badge._id,
      code: badge.code,
      name: badge.name,
      description: badge.description,
      image: badge.image,
      color: badge.color,
      value: valueMap.get(badge._id.toString()) ?? 0,
      total: badge.value,
      earned: earnedAt !== undefined,
      earnedAt: earnedAt !== undefined ? formatDate(earnedAt) : "",
    };
  });
};
