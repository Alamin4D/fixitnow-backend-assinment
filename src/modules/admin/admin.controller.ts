import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AdminService.getAllUsers(req.query as any);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Users retrieved successfully.",
            data: result
        })
    } catch (error) { next(error); }
};

const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AdminService.updateUserStatus(req.params.id as string, req.body.status);
        const action = req.body.status === "BANNED" ? "banned" : "unbanned";
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: `User ${action}.`,
            data: result
        })
    } catch (error) { next(error); }
};

const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AdminService.getAllBookings(req.query as any);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Bookings retrieved successfully.",
            meta: result.meta,
            data: result.data
        })
    } catch (error) { next(error); }
};

export const AdminController = {
    getAllUsers,
    updateUserStatus,
    getAllBookings
};