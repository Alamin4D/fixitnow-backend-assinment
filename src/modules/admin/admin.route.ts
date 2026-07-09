import { Router } from "express";
import { AdminController } from "./admin.controller";
import { CategoryController } from "../category/category.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();


router.use(auth(UserRole.ADMIN));

router.get("/users", AdminController.getAllUsers);
router.patch("/users/:id", AdminController.updateUserStatus);
router.get("/bookings", AdminController.getAllBookings);
router.get("/categories", CategoryController.getAll);
router.get("/categories/:id", CategoryController.getById);
router.post("/categories", CategoryController.create);
router.put("/categories/:id", CategoryController.update);
router.delete("/categories/:id", CategoryController.remove);

export const AdminRoutes = router;