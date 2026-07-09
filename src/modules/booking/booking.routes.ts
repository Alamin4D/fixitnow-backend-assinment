import { Router } from "express";
import { BookingController } from "./booking.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();


router.post("/", auth(UserRole.CUSTOMER), BookingController.create);
router.get("/", auth(UserRole.CUSTOMER, UserRole.TECHNICIAN), BookingController.getMyBookings);
router.get("/:id", auth(UserRole.CUSTOMER, UserRole.TECHNICIAN, UserRole.ADMIN), BookingController.getById);
router.patch("/:id/cancel", auth(UserRole.CUSTOMER), BookingController.cancel);

export const BookingRoutes = router;