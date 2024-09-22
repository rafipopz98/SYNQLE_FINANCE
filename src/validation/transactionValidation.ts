import joi from "joi";

export const createTransactionValidation = joi.object({
  user_id: joi.string().required(),
  amount: joi.number().required(),
  category: joi.string().required(),
  date: joi.date().required(),
  description: joi.string().optional(),
  type: joi.string().valid("income", "expense").default("income").optional(),
});

export const viewAllTransactionValidation = joi.object({
  user_id: joi.string().required(),
  skip: joi.number().default(0).min(0),
  limit: joi.number().default(10).min(10).max(20),
  from: joi.date().required(),
  to: joi.date().required(),
});

export const deleteTransactionValidation = joi.object({
  user_id: joi.string().required(),
  transactionId: joi.string().required(),
});
