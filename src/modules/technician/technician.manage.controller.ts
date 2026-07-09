import { Request, Response, NextFunction } from "express";
import { TechnicianManageService } from "./technician.manage.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await TechnicianManageService.createProfile(req.user!.id, req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Profile created successfully.",
            data: result
        });
    } catch (error) { next(error); }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await TechnicianManageService.updateProfile(req.user!.id, req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Profile updated successfully.",
            data: result
        });
    } catch (error) { next(error); }
};

const updateAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await TechnicianManageService.updateAvailability(req.user!.id, req.body.slots);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Availability updated successfully.",
            data: result
        });
    } catch (error) { next(error); }
};

const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await TechnicianManageService.getMyBookings(req.user!.id, req.query as any);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Bookings retrieved successfully.",
            meta: result.meta,
            data: result.data
        });
    } catch (error) { next(error); }
};

const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await TechnicianManageService.updateBookingStatus(req.user!.id, req.params.id as string, req.body.status);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Booking status updated.",
            data: result
        });
    } catch (error) { next(error); }
};

export const TechnicianManageController = {
    createProfile,
    updateProfile,
    updateAvailability,
    getMyBookings,
    updateBookingStatus
};