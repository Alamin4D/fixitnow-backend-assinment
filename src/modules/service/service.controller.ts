import { Request, Response, NextFunction } from "express";
import { ServiceService } from "./service.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceService.getAll(req.query as any);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Services retrieved successfully.",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) { next(error); }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceService.getById(req.params.id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Service retrieved successfully.",
      data: result,
    });
  } catch (error) { next(error); }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceService.create(req.user!.id, req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Service created successfully.",
      data: result,
    });
  } catch (error) { next(error); }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceService.update(req.params.id as string, req.user!.id, req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Service updated successfully.",
      data: result,
    });
  } catch (error) { next(error); }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ServiceService.remove(req.params.id as string, req.user!.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
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