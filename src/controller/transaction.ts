import { Request, Response } from "express";
import mongoose from "mongoose";
import { Category, Transaction, YearlyHistory } from "../database/model";
import {
  createTransactionValidation,
  deleteTransactionValidation,
  viewAllTransactionValidation,
} from "../validation/transactionValidation";
import MonthHistory from "../database/model/monthly_history";

export const createTransaction = async (req: Request, res: Response) => {
  const { user_id } = req?.user;
  const { amount, category, date, description, type } = req.body;

  const { error } = createTransactionValidation.validate({
    user_id,
    amount,
    category,
    date,
    description,
    type,
  });
  if (error) {
    return res.status(400).send({
      error: error.details[0].message,
      message: "Validation error",
    });
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const categoryRow = await Category.findOne({
        userId: user_id,
        name: category,
      }).session(session);

      if (!categoryRow) {
        return res.status(404).send({ message: "Category not found" });
      }

      await Transaction.create(
        [
          {
            userId: user_id,
            amount,
            date,
            description: description || "",
            type,
            category: categoryRow.name,
            categoryIcon: categoryRow.icon,
          },
        ],
        { session }
      );

      await MonthHistory.updateOne(
        {
          userId: user_id,
          day: date.getUTCDate(),
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
        {
          $inc: {
            expense: type === "expense" ? amount : 0,
            income: type === "income" ? amount : 0,
          },
        },
        { upsert: true, session }
      );

      // Step 4: Update Year History
      await YearlyHistory.updateOne(
        {
          userId: user_id,
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
        {
          $inc: {
            expense: type === "expense" ? amount : 0,
            income: type === "income" ? amount : 0,
          },
        },
        { upsert: true, session }
      );
    });

    console.log("Transaction processed successfully.");
    return res
      .status(200)
      .send({ message: "Transaction processed successfully" });
  } catch (error) {
    console.error("Error processing transaction:", error);
    return res.status(500).send({ error, message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

export const viewTransaction = async (req: Request, res: Response) => {
  const { user_id } = req?.user;
  const { skip, limit, from, to } = req.query;

  const { error } = viewAllTransactionValidation.validate({
    user_id,
    skip,
    limit,
    from,
    to,
  });
  if (error) {
    return res.status(400).send({
      error: error.details[0].message,
      message: "Validation error",
    });
  }

  try {
    const data = await Transaction.find({
      userId: user_id,
      date: { $gte: from, $lte: to },
    })
      .skip(skip ? Number(skip) : 0)
      .limit(limit ? Number(limit) : 10)
      .sort({ created_at: -1 })
      .lean()
      .exec();
    if (!data) {
      return res
        .status(400)
        .send({ message: "Error while fetching transactions" });
    }
    return res
      .status(200)
      .send({ data, message: "successfully fetched the transactions" });
  } catch (error) {
    console.log("Error while fetching user transactions", error);
    return res.status(500).send({ error, message: "Internal server error" });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  const { user_id } = req?.user;
  const { transactionId } = req.params;
  const { error } = deleteTransactionValidation.validate({
    user_id,
    transactionId,
  });
  if (error) {
    return res.status(400).send({
      error: error.details[0].message,
      message: "Validation error",
    });
  }

  const session = await mongoose.startSession();

  try {
    const transaction = await Transaction.findOne({
      userId: user_id,
      _id: transactionId,
    });

    if (!transaction) {
      return res.status(404).send({ message: "Transaction not found!" });
    }

    await session.withTransaction(async () => {
      await Transaction.deleteOne({
        _id: transactionId,
        userId: user_id,
      }).session(session);

      await MonthHistory.updateOne(
        {
          userId: user_id,
          day: transaction.date.getUTCDate(),
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
        {
          $inc: {
            expense: transaction.type === "expense" ? -transaction.amount : 0,
            income: transaction.type === "income" ? -transaction.amount : 0,
          },
        },
        { session }
      );

      await YearlyHistory.updateOne(
        {
          userId: user_id,
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
        {
          $inc: {
            expense: transaction.type === "expense" ? -transaction.amount : 0,
            income: transaction.type === "income" ? -transaction.amount : 0,
          },
        },
        { session }
      );
    });

    console.log("Transaction deleted successfully.");
    return res
      .status(200)
      .send({ message: "Transaction deleted successfully." });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return res.status(500).send({ error, message: "Internal server error" });
  } finally {
    session.endSession();
  }
};
