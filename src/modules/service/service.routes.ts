import { Router } from "express";
import { ServiceController } from "./service.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

// const authGuard = (...requiredRoles: string[]) => {
//   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     let token: string | undefined;
//     if (req.headers.authorization) {
//       token = req.headers.authorization.startsWith("Bearer ")
//         ? req.headers.authorization.split(" ")[1]
//         : req.headers.authorization;
//     } else if (req.cookies?.accessToken) { token = req.cookies.accessToken; }

//     if (!token) { res.status(401).json({ success: false, message: "No token provided." }); return; }

//     try {
//       const decoded: any = jwt.verify(token, config.jwt_access_secret);
//       if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
//         res.status(403).json({ success: false, message: `Required: ${requiredRoles.join(", ")}. Your: ${decoded.role}.` });
//         return;
//       }
//       const user = await prisma.user.findUnique({ where: { id: decoded.id } });
//       if (!user) { res.status(404).json({ success: false, message: "User not found." }); return; }
//       if (user.status === "BANNED") { res.status(403).json({ success: false, message: "Account banned." }); return; }
//       (req as any).user = { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role };
//       next();
//     } catch (err: any) {
//       res.status(401).json({ success: false, message: "Invalid token.", errorDetails: [{ path: "token", message: err.message }] });
//       return;
//     }
//   };
// };

router.get("/", ServiceController.getAll);
router.get("/:id", ServiceController.getById);
router.post("/", auth(UserRole.TECHNICIAN), ServiceController.create);
router.put("/:id", auth(UserRole.TECHNICIAN), ServiceController.update);
router.delete("/:id", auth(UserRole.TECHNICIAN), ServiceController.remove);

export const ServiceRoutes = router;