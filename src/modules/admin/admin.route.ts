import { Router } from "express";
import { AdminController } from "./admin.controller";
import { CategoryController } from "../category/category.controller";
// import jwt from "jsonwebtoken";
// import { prisma } from "../../lib/prisma";
// import config from "../../config";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

// const authGuard = (...requiredRoles: string[]) => {
//   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     let token: string | undefined;
//     if (req.headers.authorization) { token = req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : req.headers.authorization; }
//     else if (req.cookies?.accessToken) { token = req.cookies.accessToken; }
//     if (!token) { res.status(401).json({ success: false, message: "No token provided." }); return; }
//     try {
//       const decoded: any = jwt.verify(token, config.jwt_access_secret);
//       if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) { res.status(403).json({ success: false, message: `Required: ${requiredRoles.join(", ")}. Your: ${decoded.role}.` }); return; }
//       const user = await prisma.user.findUnique({ where: { id: decoded.id } });
//       if (!user) { res.status(404).json({ success: false, message: "User not found." }); return; }
//       if (user.status === "BANNED") { res.status(403).json({ success: false, message: "Account banned." }); return; }
//       (req as any).user = { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role };
//       next();
//     } catch (err: any) { res.status(401).json({ success: false, message: "Invalid token." }); return; }
//   };
// };

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