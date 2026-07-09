import { Request, Response, NextFunction } from "express";
import { BookingService } from "./booking.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingService.create(req.user!.id, req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Booking created successfully.",
      data: result
    });
  } catch (error) { next(error); }
};

const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingService.getMyBookings(req.user!.id, req.user!.role, req.query as any);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Bookings retrieved successfully.",
      meta: result.meta,
      data: result.data
    });
  } catch (error) { next(error); }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingService.getById(req.params.id as string, req.user!.id, req.user!.role);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Booking retrieved successfully.",
      data: result
    });
  } catch (error) { next(error); }
};

const cancel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingService.cancel(req.params.id as string, req.user!.id, req.body.cancellationReason);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Booking cancelled.",
      data: result
    });
  } catch (error) { next(error); }
};

export const BookingController = {
  create,
  getMyBookings,
  getById,
  cancel
};