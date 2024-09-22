import { Request, Response } from "express";
import Joi from "joi";

export const currencyEditValidation = Joi.object({
  user_id: Joi.string().required(),
  currency: Joi.string().valid("$", "€", "₹", "¥", "£").default("$").required(),
});

export const isUser_Id_Present = Joi.object({
  user_id: Joi.string().required(),
});

export const validateUserId = (req: Request, res: Response): boolean => {
  if (!req?.user || !req.user.user_id) {
    res.status(400).send({
      error: "User ID is missing",
      message: "User is not authenticated or User ID is not present",
    });
    return false;
  }

  const { user_id } = req.user;

  const userIDValidationResult = isUser_Id_Present.validate({ user_id });
  if (userIDValidationResult.error) {
    res.status(400).send({
      error: userIDValidationResult.error.details[0].message,
      message: "Validation error for user_id",
    });
    return false;
  }

  return true;
};
