import { Router } from "express";
import { ReviewController } from "./review.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();


router.post("/", auth(UserRole.CUSTOMER), ReviewController.create);
router.get("/technician/:technicianId", ReviewController.getByTechnicianId);

export const ReviewRoutes = router;