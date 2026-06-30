import { Types } from "mongoose";
import Question, { QuestionMode, type QuestionDocument } from "../models/Question";
import type { Question as QuestionInput } from "../helpers/sessionAssert";
import type { TargetAudienceType } from "../types/types";

export const createQuestion = async (
  data: QuestionInput,
): Promise<QuestionDocument> => {
  return Question.create(data);
};

type NearestQuestionParams = {
  latitude: number;
  longitude: number;
  targetAudience: TargetAudienceType;
  type?: QuestionMode;
  excludeIds: Types.ObjectId[];
};

export const findNearestQuestion = async ({
  latitude,
  longitude,
  targetAudience,
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

  if (type) filter.type = type;

  if (targetAudience === "parent") {
    filter.targetAudience = { $in: ["parent", "all"] };
  } else if (targetAudience === "child") {
    filter.targetAudience = { $in: ["child", "all"] };
  }

  if (excludeIds.length > 0) {
    filter._id = { $nin: excludeIds };
  }

  return Question.findOne(filter).lean();
};
