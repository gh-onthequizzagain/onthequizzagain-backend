import Question from "../models/Question";
import type { Question as QuestionInput } from "../helpers/sessionAssert";

export const createQuestion = async (data: QuestionInput) => {
  const question = await Question.create(data);
  return question;
};
