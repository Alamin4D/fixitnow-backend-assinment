import { Router } from "express";
import { ServiceController } from "./service.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();


router.get("/", ServiceController.getAll);
router.get("/:id", ServiceController.getById);
router.post("/", auth(UserRole.TECHNICIAN), ServiceController.create);
router.put("/:id", auth(UserRole.TECHNICIAN), ServiceController.update);
router.delete("/:id", auth(UserRole.TECHNICIAN), ServiceController.remove);

export const ServiceRoutes = router;