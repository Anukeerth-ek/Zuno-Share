import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
     userId?: string;
}

type JwtPayload = { userId: string };

export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
     const auth = req.headers.authorization;
     if (!auth?.startsWith("Bearer ")) {
       res.status(401).json({ message: "No token provided" });
       return
     }
     const token = auth.split(" ")[1];

     try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
          req.userId = decoded.userId;
          // Also set req.user for consistency if controller uses it
          (req as any).user = { id: decoded.userId };
          next();
          return
     } catch {
       res.status(401).json({ message: "Invalid token" });
       return
     }
};

export const optionalAuthenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      next(); // No token, proceed without user
      return;
    }
    const token = auth.split(" ")[1];

    try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
         req.userId = decoded.userId;
         (req as any).user = { id: decoded.userId };
         next();
    } catch {
      // Invalid token, just proceed without user (or could warn)
      next();
    }
};
