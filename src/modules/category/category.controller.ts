import { Request, Response, NextFunction } from "express";
import { CategoryService } from "./category.service";

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CategoryService.getAll();
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Categories retrieved successfully.",
      data: result,
    });
  } catch (error) { next(error); }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CategoryService.getById(req.params.id as string);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Category retrieved successfully.",
      data: result,
    });
  } catch (error) { next(error); }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CategoryService.create(req.body);
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Category created successfully.",
      data: result,
    });
  } catch (error) { next(error); }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CategoryService.update(req.params.id as string, req.body);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Category updated successfully.",
      data: result,
    });
  } catch (error) { next(error); }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await CategoryService.remove(req.params.id as string);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Category deleted successfully.",
      data: null,
    });
  } catch (error) { next(error); }
};

export const CategoryController = { 
    getAll, 
    getById, 
    create, 
    update, 
    remove 
};