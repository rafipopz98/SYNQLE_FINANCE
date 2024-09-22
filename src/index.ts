import express, { NextFunction, Request, Response } from "express";
import { connectDB } from "./database/dbConnect";
import { PORT } from "./config/config";
import cors from "cors";
import cookieparser from "cookie-parser";

import userCurrency from "./routes/userCurrencyRoutes";
import categoryRoute from "./routes/category";
import transactionRoute from "./routes/transaction";
import historyRoute from "./routes/historyRoute";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();

app.use(cookieparser());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("\n", req.url);
  res.header("Access-Control-Allow-Credentials");
  next();
});

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/currency", userCurrency);
app.use("/category", categoryRoute);
app.use("/transaction", transactionRoute);
app.use("/history", historyRoute);

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
