import joi from "joi";

export const addCategoryValidation = joi.object({
  user_id: joi.string().required(),
  name: joi.string().required(),
  icon: joi.string().required(),
  type: joi.string().valid("income", "expense").default("income").required(),
});

export const viewAllCategoryValidation = joi.object({
  user_id: joi.string().required(),
  type: joi.string().valid("income", "expense").default("income").required(),
  skip: joi.number().default(0).min(0),
  limit: joi.number().default(10).min(10).max(20),
});

export const editCategoryValidation = joi.object({
  user_id: joi.string().required(),
  categoryId: joi.string().required(),
  name: joi.string().optional(),
  icon: joi.string().optional(),
  type: joi.string().valid("income", "expense").default("income").optional(),
});

export const deleteCategoryValidation = joi.object({
  user_id: joi.string().required(),
  categoryId: joi.string().required(),
});

export const categoryStatValidation = joi.object({
  user_id: joi.string().required(),
  type: joi.string().valid("income", "expense").default("income").required(),
  from: joi.date().required(),
  to: joi.date().required(),
});
