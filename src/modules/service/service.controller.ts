import { Request, Response, NextFunction } from "express";
import { ServiceService } from "./service.service";

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceService.getAll(req.query as any);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Services retrieved successfully.",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) { next(error); }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceService.getById(req.params.id as string);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Service retrieved successfully.",
      data: result,
    });
  } catch (error) { next(error); }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceService.create(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Service created successfully.",
      data: result,
    });
  } catch (error) { next(error); }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceService.update(req.params.id as string, req.user!.id, req.body);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Service updated successfully.",
      data: result,
    });
  } catch (error) { next(error); }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ServiceService.remove(req.params.id as string, req.user!.id);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Service deleted successfully.",
      data: null,
    });
  } catch (error) { next(error); }
};

export const ServiceController = { 
    getAll, 
    getById, 
    create, 
    update, 
    remove 
};