import express from "express";
import {
  addCategory,
  deleteCategory,
  editCategory,
  viewCategory,
} from "../controller";
import { isAuthUser } from "../middleware/isAuthUser";

const categoryRouter = express.Router();

categoryRouter.get("/all", viewCategory);
categoryRouter.post("/add", addCategory);
categoryRouter.patch("/edit/:categoryId", editCategory);
categoryRouter.delete("/delete/:categoryId", deleteCategory);

categoryRouter.use(isAuthUser);

export default categoryRouter;
