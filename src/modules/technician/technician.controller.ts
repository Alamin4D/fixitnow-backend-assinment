import { Request, Response, NextFunction } from "express";
import { TechnicianService } from "./technician.service";

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TechnicianService.getAll(req.query as any);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Technicians retrieved successfully.",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) { next(error); }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TechnicianService.getById(req.params.id as string);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Technician profile retrieved successfully.",
      data: result,
    });
  } catch (error) { next(error); }
};

export const TechnicianController = { 
    getAll, 
    getById 
};