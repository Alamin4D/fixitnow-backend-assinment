import { Request, Response, NextFunction } from "express";
import { ReviewService } from "./review.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ReviewService.create(req.user!.id, req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review submitted.",
      data: result
    });
  } catch (error) { next(error); }
};

const getByTechnicianId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ReviewService.getByTechnicianId(req.params.technicianId as string, req.query as any);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Reviews retrieved successfully.",
      meta: result.meta,
      data: result.data
    });
  } catch (error) { next(error); }
};

export const ReviewController = {
  create,
  getByTechnicianId
};