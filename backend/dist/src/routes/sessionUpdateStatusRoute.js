"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const asyncHandler_1 = require("../utils/asyncHandler");
const sessionUpdateStatus_1 = require("../controllers/sessionUpdateStatus");
const router = express_1.default.Router();
router.patch("/sessions/:id/status", authMiddleware_1.authenticateUser, (0, asyncHandler_1.asyncHandler)(sessionUpdateStatus_1.updateSessionStatus));
exports.default = router;
