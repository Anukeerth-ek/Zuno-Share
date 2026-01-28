"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const profileController_1 = require("../controllers/profileController");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.authenticateUser, profileController_1.updateUserProfile);
exports.default = router;
