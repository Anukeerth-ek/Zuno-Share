"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const filteredProfiles_1 = require("../controllers/filteredProfiles");
const optionalAuthMiddleware_1 = require("../middleware/optionalAuthMiddleware");
// import { authenticateUser } from "../middleware/authMiddleware";
const profileRouter = (0, express_1.Router)();
profileRouter.get("/filter", optionalAuthMiddleware_1.optionalAuth, filteredProfiles_1.getFilteredProfile);
exports.default = profileRouter;
