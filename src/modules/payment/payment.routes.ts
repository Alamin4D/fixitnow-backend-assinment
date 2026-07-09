import { Router } from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();


// Checkout Session - redirect payment page
router.post("/checkout", auth(UserRole.CUSTOMER), PaymentController.createCheckout);

// Verify after redirect back
router.post("/verify", auth(UserRole.CUSTOMER), PaymentController.verifyPayment);

// Direct payment (Postman test - auto confirm)
router.post("/create", auth(UserRole.CUSTOMER), PaymentController.createPayment);

// Payment history
router.get("/", auth(UserRole.CUSTOMER, UserRole.ADMIN), PaymentController.getMyPayments);

// Payment by id
router.get("/:id", auth(UserRole.CUSTOMER, UserRole.ADMIN), PaymentController.getPaymentById);

export const PaymentRoutes = router;