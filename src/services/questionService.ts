import { Types } from "mongoose";
import Question, { type QuestionDocument } from "../models/Question";
import type { Question as QuestionInput } from "../helpers/sessionAssert";
import type { PublicCibleType, SessionQuestionType } from "../types/types";

export const createQuestion = async (
  data: QuestionInput,
): Promise<QuestionDocument> => {
  return Question.create(data);
};

type NearestQuestionParams = {
  latitude: number;
  longitude: number;
  publicCible: PublicCibleType;
  type: SessionQuestionType;
  excludeIds: Types.ObjectId[];
};

export const findNearestQuestion = async ({
  latitude,
  longitude,
  publicCible,
  type,
  excludeIds,
}: NearestQuestionParams) => {
  const filter: Record<string, unknown> = {
    localisation: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
      },
    },
  };

  if (type === "QCM") filter.type = "multipleChoice";
  else if (type === "vraifaux") filter.type = "trueFalse";

  if (publicCible === "parent") {
    filter.publicCible = { $in: ["parent", "tous"] };
  } else if (publicCible === "enfant") {
    filter.publicCible = { $in: ["enfant", "tous"] };
  }

  if (excludeIds.length > 0) {
    filter._id = { $nin: excludeIds };
  }

  return Question.findOne(filter).lean();
};
