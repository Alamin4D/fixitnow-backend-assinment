import { Request, Response, NextFunction } from "express";
import { BookingService } from "./booking.service";

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, statusCode: 201, message: "Booking created successfully.", data: result });
  } catch (error) { next(error); }
};

const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingService.getMyBookings(req.user!.id, req.user!.role, req.query as any);
    res.status(200).json({ success: true, statusCode: 200, message: "Bookings retrieved.", meta: result.meta, data: result.data });
  } catch (error) { next(error); }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingService.getById(req.params.id as string, req.user!.id, req.user!.role);
    res.status(200).json({ success: true, statusCode: 200, message: "Booking retrieved.", data: result });
  } catch (error) { next(error); }
};

const cancel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingService.cancel(req.params.id as string, req.user!.id, req.body.cancellationReason);
    res.status(200).json({ success: true, statusCode: 200, message: "Booking cancelled.", data: result });
  } catch (error) { next(error); }
};

export const BookingController = { 
    create, 
    getMyBookings, 
    getById, 
    cancel 
};