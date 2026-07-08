import { Request, Response, NextFunction } from "express";
import { ReviewService } from "./review.service";

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ReviewService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, statusCode: 201, message: "Review submitted.", data: result });
  } catch (error) { next(error); }
};

const getByTechnicianId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ReviewService.getByTechnicianId(req.params.technicianId as string, req.query as any);
    res.status(200).json({ success: true, statusCode: 200, message: "Reviews retrieved.", meta: result.meta, data: result.data });
  } catch (error) { next(error); }
};

export const ReviewController = { 
    create, 
    getByTechnicianId 
};