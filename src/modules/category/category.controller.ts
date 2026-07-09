import { Request, Response, NextFunction } from "express";
import { CategoryService } from "./category.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await CategoryService.getAll();
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Categories retrieved successfully.",
            data: result,
        });
    } catch (error) { next(error); }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await CategoryService.getById(req.params.id as string);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Category retrieved successfully.",
            data: result,
        });
    } catch (error) { next(error); }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await CategoryService.create(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Category created successfully.",
            data: result,
        });
    } catch (error) { next(error); }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await CategoryService.update(req.params.id as string, req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Category updated successfully.",
            data: result,
        });
    } catch (error) { next(error); }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CategoryService.remove(req.params.id as string);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
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