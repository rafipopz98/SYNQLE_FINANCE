import { Request, Response } from "express";
import {
  addCategoryValidation,
  categoryStatValidation,
  deleteCategoryValidation,
  editCategoryValidation,
  viewAllCategoryValidation,
} from "../validation/categoryValidation";
import { Category } from "../database/model";

export const addCategory = async (req: Request, res: Response) => {
  const { name, icon, type } = req.body;
  const { user_id } = req?.user;
  const { error } = addCategoryValidation.validate({
    user_id,
    name,
    icon,
    type,
  });
  if (error) {
    return res.status(400).send({
      error: error.details[0].message,
      message: "Validation error",
    });
  }

  try {
    const categoryAddData = new Category({ name, icon, type, userId: user_id });
    const data = await categoryAddData.save();

    if (!data) {
      return res.status(400).send({ message: "Error while saving category" });
    }

    return res
      .status(200)
      .send({ data, message: "successfully added the category" });
  } catch (error) {
    console.log("Error while adding category", error);
    return res.status(500).send({ error, message: "Internal server error" });
  }
};

export const viewCategory = async (req: Request, res: Response) => {
  const { user_id } = req?.user;

  const { type, skip, limit } = req.query;
  const { error } = viewAllCategoryValidation.validate({
    user_id,
    type,
    skip,
    limit,
  });

  if (error) {
    return res.status(400).send({
      error: error.details[0].message,
      message: "Validation error",
    });
  }

  try {
    const data = await Category.find({ userId: user_id, type })
      .skip(0)
      .limit(10)
      .lean()
      .exec();
    if (!data) {
      return res.status(400).send({ message: "Error while fetching category" });
    }
    return res
      .status(200)
      .send({ data, message: "successfully fetched the category" });
  } catch (error) {
    console.log("Error while fetching category", error);
    return res.status(500).send({ error, message: "Internal server error" });
  }
};

export const editCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { user_id } = req?.user;
  const { name, icon, type } = req.body;

  const { error } = editCategoryValidation.validate({
    user_id,
    name,
    icon,
    type,
    categoryId,
  });
  if (error) {
    return res.status(400).send({
      error: error.details[0].message,
      message: "Validation error",
    });
  }

  try {
    const data = await Category.findOneAndUpdate(
      { _id: categoryId, userId: req.user?.user_id },
      { $set: { name, icon, type } },
      { new: true, runValidators: true }
    );

    if (!data) {
      return res
        .status(404)
        .send({ message: "Category not found or does not belong to the user" });
    }
    return res
      .status(200)
      .send({ data, message: "successfully updated the category" });
  } catch (error) {
    console.log("Error while editing category", error);
    res.status(500).send({ error, message: "Internal server error" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { user_id } = req?.user;
  const { categoryId } = req.params;
  const { error } = deleteCategoryValidation.validate({ user_id, categoryId });
  if (error) {
    return res.status(400).send({
      error: error.details[0].message,
      message: "Validation error",
    });
  }

  try {
    const data = await Category.findOneAndDelete({
      _id: categoryId,
      userId: user_id,
    });
    if (!data) {
      return res
        .status(404)
        .send({ message: "Category not found or does not belong to the user" });
    }
    return res
      .status(200)
      .send({ data, message: "successfully deleted the category" });
  } catch (error) {
    console.log("Error while deleting category", error);
    res.status(500).send({ error, message: "Internal server error" });
  }
};

export const categoryStat = async (req: Request, res: Response) => {
  const { user_id } = req?.user;
  const { from, to, type } = req.query;

  const { error } = categoryStatValidation.validate({
    user_id,
    from,
    to,
    type,
  });
  if (error) {
    return res.status(400).send({
      error: error.details[0].message,
      message: "Validation error",
    });
  }

  try {
    const stats = await Category.aggregate([
      {
        $match: {
          userId: user_id,
          date: {
            $gte: from,
            $lte: to,
          },
        },
      },
      {
        $group: {
          _id: {
            type: "$type",
            category: "$category",
            categoryIcon: "$categoryIcon",
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    const data = stats.map((stat) => ({
      type: stat._id.type,
      category: stat._id.category,
      categoryIcon: stat._id.categoryIcon,
      totalAmount: stat.totalAmount,
    }));

    return res
      .status(200)
      .send({ data, message: "successfully fetched the stat" });
  } catch (error) {
    console.log("Error while fetching category stat", error);
    return res.status(500).send({ error, message: "Internal server error" });
  }
};
