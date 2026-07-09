import { Router, Request, Response, NextFunction } from "express";
import { TechnicianManageController } from "./technician.manage.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();


router.post("/profile", auth(UserRole.TECHNICIAN), TechnicianManageController.createProfile);
router.put("/profile", auth(UserRole.TECHNICIAN), TechnicianManageController.updateProfile);
router.put("/availability", auth(UserRole.TECHNICIAN), TechnicianManageController.updateAvailability);
router.get("/bookings", auth(UserRole.TECHNICIAN), TechnicianManageController.getMyBookings);
router.patch("/bookings/:id", auth(UserRole.TECHNICIAN), TechnicianManageController.updateBookingStatus);

export const TechnicianManageRoutes = router;