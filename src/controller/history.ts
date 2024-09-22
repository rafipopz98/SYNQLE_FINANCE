import { Request, Response } from "express";
import { getHistoryValidation } from "../validation/historyValidation";
import { MonthlyHistory, YearlyHistory } from "../database/model";
import { HistoryData } from "../helpers/types";
import { getDaysInMonth } from "date-fns";
import MonthHistory from "../database/model/monthly_history";
import { isUser_Id_Present } from "../validation/currencyValidation";

export const getHistory = async (req: Request, res: Response) => {
  const { user_id } = req?.user;
  const { timeframe, year, month } = req.query;

  const { error } = getHistoryValidation.validate({
    user_id,
    timeframe,
    year,
    month,
  });

  if (error) {
    return res.status(400).send({
      error: error.details[0].message,
      message: "Validation error",
    });
  }

  try {
    switch (timeframe) {
      case "month":
        return await getYearHistoryData(user_id, Number(year));
      case "year":
        return await getMonthHistoryData(user_id, Number(year), Number(month));
    }
  } catch (error) {
    console.log("Error while fetching history", error);
    return res.status(500).send({ error, message: "Internal server error" });
  }
};

async function getYearHistoryData(userId: string, year: number) {
  const result = await YearlyHistory.aggregate([
    { $match: { userId, year } },
    {
      $group: {
        _id: "$month",
        totalExpense: { $sum: "$expense" },
        totalIncome: { $sum: "$income" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const history: HistoryData[] = [];

  for (let i = 0; i < 12; i++) {
    const monthData = result.find((row) => row._id === i);
    history.push({
      year,
      month: i,
      expense: monthData ? monthData.totalExpense : 0,
      income: monthData ? monthData.totalIncome : 0,
    });
  }

  return history;
}

async function getMonthHistoryData(
  userId: string,
  year: number,
  month: number
) {
  const result = await MonthlyHistory.aggregate([
    { $match: { userId, year, month } },
    {
      $group: {
        _id: "$day",
        totalExpense: { $sum: "$expense" },
        totalIncome: { $sum: "$income" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const history: HistoryData[] = [];
  const daysInMonth = getDaysInMonth(new Date(year, month));

  // Fill all days of the month, even if there is no data
  for (let i = 1; i <= daysInMonth; i++) {
    const dayData = result.find((row) => row._id === i);
    history.push({
      year,
      month,
      day: i,
      expense: dayData ? dayData.totalExpense : 0,
      income: dayData ? dayData.totalIncome : 0,
    });
  }

  return history;
}

export const historyPeriods = async (req: Request, res: Response) => {
  const { user_id } = req?.user;
  const { error } = isUser_Id_Present.validate({ user_id });
  if (error)
    return res
      .status(400)
      .send({ error: error.details[0].message, message: "Validation error" });

  try {
    const result = await MonthHistory.aggregate([
      {
        $match: {
          userId: user_id,
        },
      },
      {
        $group: {
          _id: "$year",
        },
      },
      {
        $sort: {
          _id: 1, // Sort by year ascending
        },
      },
    ]);

    const years = result.map((el) => el._id);

    if (years.length === 0) {
      return [new Date().getFullYear()];
    }

    return res.status(200).send({ data: years, message: "success" });
  } catch (error) {
    console.log("Error while fetching history", error);
    return res.status(500).send({ error, message: "Internal server error" });
  }
};
