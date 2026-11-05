import { Router } from "express";
import { AuthController, googleLogin } from "./auth.controller";
import auth from "../../middleware/auth";


const router = Router();


router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", auth(), AuthController.getMe);
router.post("/google", googleLogin);


export const AuthRoutes = router;