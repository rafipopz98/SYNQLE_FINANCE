import { Request, Response } from "express";
import { Transaction, User } from "../database/model";
import {
  currencyEditValidation,
  isUser_Id_Present,
} from "../validation/currencyValidation";
import { splitType } from "../helpers/types";

export const editUserCurrency = async (req: Request, res: Response) => {
  const { user_id } = req?.user;
  const { currency } = req.body;

  const { error } = currencyEditValidation.validate({
    user_id,
    currency,
  });
  if (error)
    return res
      .status(400)
      .send({ error: error.details[0].message, message: "Validation error" });

  try {
    const data = await User.findByIdAndUpdate(user_id, { currency })
      .lean()
      .exec();
    if (!data) {
      res.status(404).send({ message: "User not found" });
    }
    return res
      .status(200)
      .send({ data, message: "successfully updated the currency" });
  } catch (error) {
    console.log("Error while updating user currency", error);
    res.status(500).send({ error, message: "Internal server error" });
  }
};

export const viewUserCurrency = async (req: Request, res: Response) => {
  const { user_id } = req?.user;
  const { error } = isUser_Id_Present.validate({ user_id });
  if (error)
    return res
      .status(400)
      .send({ error: error.details[0].message, message: "Validation error" });

  try {
    const data = await User.findById(user_id).select("currency").lean().exec();
    if (!data) {
      res.status(404).send({ message: "User not found" });
    }
    return res
      .status(200)
      .send({ data, message: "successfully fetched the currency" });
  } catch (error) {
    console.log("Error while fetching user currency", error);
    res.status(500).send({ error, message: "Internal server error" });
  }
};

export const totalSplit = async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const { user_id } = req?.user;

  try {
    const totals = await Transaction.aggregate([
      {
        $match: {
          userId: user_id,
          date: {
            $gte: new Date(from as string),
            $lte: new Date(to as string),
          },
        },
      },
      {
        $group: {
          _id: "$type",
          totalIncome: { $sum: "$amount" },
        },
      },
    ]);

    const data: splitType = {
      expense: Number(
        totals.find((t) => t._id === "expense")?.totalAmount || 0
      ),
      income: Number(totals.find((t) => t._id === "income")?.totalAmount || 0),
    };

    data.balance = data.income - data.expense;

    return res.status(200).send({ data, message: "Total income fetched" });
  } catch (error) {
    console.log("Error while fetching total income", error);
    return res.status(500).send({ error, message: "Internal server error" });
  }
};
