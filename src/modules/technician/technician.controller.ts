import { Request, Response, NextFunction } from "express";
import { TechnicianService } from "./technician.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await TechnicianService.getAll(req.query as any);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Technicians retrieved successfully.",
            meta: result.meta,
            data: result.data,
        });
    } catch (error) { next(error); }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await TechnicianService.getById(req.params.id as string);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Technician profile retrieved successfully.",
            data: result,
        });
    } catch (error) { next(error); }
};

export const TechnicianController = {
    getAll,
    getById
};