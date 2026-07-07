import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.register(req.body);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "User registered successfully.",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.login(req.body);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User logged in successfully.",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("getMe called, req.user:", req.user);
    const result = await AuthService.getMe(req.user!.id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User profile retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const AuthController = { register, login, getMe };