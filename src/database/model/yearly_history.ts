import mongoose from "mongoose";

const YearlyHistoeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  income: {
    type: Number,
    default: 0,
  },
  expense: {
    type: Number,
    default: 0,
  },
});

const YearlyHistory = mongoose.model("YearlyHistory", YearlyHistoeySchema);

export default YearlyHistory;
