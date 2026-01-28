"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const meetSessionController_1 = require("../controllers/meetSessionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.patch("/approve/:id", authMiddleware_1.authenticateUser, meetSessionController_1.acceptSession);
router.delete("/delete/:id", authMiddleware_1.authenticateUser, meetSessionController_1.deleteSession);
router.post("/request", authMiddleware_1.authenticateUser, meetSessionController_1.requestSession);
router.get("/my-sessions", authMiddleware_1.authenticateUser, meetSessionController_1.getMySessions);
router.post("/:id/roadmap", authMiddleware_1.authenticateUser, meetSessionController_1.saveRoadmap);
router.get("/:id/roadmap", authMiddleware_1.authenticateUser, meetSessionController_1.getRoadmap);
exports.default = router;
