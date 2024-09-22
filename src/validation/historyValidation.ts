import joi from "joi";

export const getHistoryValidation = joi.object({
  user_id: joi.string().required(),
  timeframe: joi.string().valid("month", "year").required(),
  year: joi.number().required().min(2000).max(3000),
  month: joi.number().required().min(0).default(0).max(11),
});
