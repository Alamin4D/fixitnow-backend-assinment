import { Router } from "express";
import { TechnicianController } from "./technician.controller";

const router = Router();

router.get("/", TechnicianController.getAll);
router.get("/:id", TechnicianController.getById);

export const TechnicianRoutes = router;