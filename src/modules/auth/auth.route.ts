import { Router } from "express";
import { AuthController } from "./auth.controller";
import auth from "../../middleware/auth";


const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", auth(), AuthController.getMe);

export const AuthRoutes = router;