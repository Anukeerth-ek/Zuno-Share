"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const getLearnersBooking_1 = require("../controllers/getLearnersBooking");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Make sure this sets req.user
const router = express_1.default.Router();
router.get('/learner', authMiddleware_1.authenticateUser, getLearnersBooking_1.getLearnerBookings);
exports.default = router;
