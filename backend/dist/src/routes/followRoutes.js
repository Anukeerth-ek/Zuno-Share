"use strict";
// src/routes/followRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const followController_1 = require("../controllers/followController");
const router = express_1.default.Router();
router.post("/", followController_1.followUser);
exports.default = router;
