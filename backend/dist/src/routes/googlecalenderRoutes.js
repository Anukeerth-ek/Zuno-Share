"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googlemeetcontroller_1 = require("../controllers/googlemeetcontroller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get("/auth", authMiddleware_1.authenticateUser, googlemeetcontroller_1.startGoogleOAuth);
router.get("/callback", authMiddleware_1.authenticateUser, googlemeetcontroller_1.handleGoogleOAuthCallback);
exports.default = router;
