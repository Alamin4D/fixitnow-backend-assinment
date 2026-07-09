import { Request, Response, NextFunction } from "express";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";


const createCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await PaymentService.createCheckoutSession(
            req.user!.id,
            req.body.bookingId
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Checkout session created. Redirect to checkoutUrl.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Verify payment after redirect
const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await PaymentService.verifyPayment(
            req.user!.id,
            req.body.sessionId
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Payment verified successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Direct payment (Postman test)
const createPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await PaymentService.createPaymentIntent(
            req.user!.id,
            req.body.bookingId
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Payment completed.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getMyPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await PaymentService.getMyPayments(
            req.user!.id,
            req.query as any
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Payment history retrieved successfully.",
            meta: result.meta,
            data: result.data,
        });
    } catch (error) {
        next(error);
    }
};

const getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await PaymentService.getPaymentById(
            req.user!.id,
            req.params.id as string,
            req.user!.role
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Payment details retrieved successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const PaymentController = {
    createCheckout,
    verifyPayment,
    createPayment,
    getMyPayments,
    getPaymentById,
};