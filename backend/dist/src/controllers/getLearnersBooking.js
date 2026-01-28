"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLearnerBookings = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getLearnerBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const learnerId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!learnerId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const sessions = yield prisma_1.default.session.findMany({
            where: { learnerId },
            include: {
                mentor: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        bio: true,
                    },
                },
            },
        });
        res.status(200).json(sessions);
        return;
    }
    catch (error) {
        console.error("Error fetching learner's bookings:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.getLearnerBookings = getLearnerBookings;
