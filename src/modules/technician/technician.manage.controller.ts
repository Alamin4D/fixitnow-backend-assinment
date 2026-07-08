import { Request, Response, NextFunction } from "express";
import { TechnicianManageService } from "./technician.manage.service";

const createProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await TechnicianManageService.createProfile(req.user!.id, req.body);
        res.status(201).json({ success: true, statusCode: 201, message: "Profile created successfully.", data: result });
    } catch (error) { next(error); }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await TechnicianManageService.updateProfile(req.user!.id, req.body);
        res.status(200).json({ success: true, statusCode: 200, message: "Profile updated successfully.", data: result });
    } catch (error) { next(error); }
};

const updateAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await TechnicianManageService.updateAvailability(req.user!.id, req.body.slots);
        res.status(200).json({ success: true, statusCode: 200, message: "Availability updated successfully.", data: result });
    } catch (error) { next(error); }
};

const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await TechnicianManageService.getMyBookings(req.user!.id, req.query as any);
        res.status(200).json({ success: true, statusCode: 200, message: "Bookings retrieved successfully.", meta: result.meta, data: result.data });
    } catch (error) { next(error); }
};

const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await TechnicianManageService.updateBookingStatus(req.user!.id, req.params.id as string, req.body.status);
        res.status(200).json({ success: true, statusCode: 200, message: "Booking status updated.", data: result });
    } catch (error) { next(error); }
};

export const TechnicianManageController = { 
    createProfile, 
    updateProfile, 
    updateAvailability, 
    getMyBookings, 
    updateBookingStatus
};