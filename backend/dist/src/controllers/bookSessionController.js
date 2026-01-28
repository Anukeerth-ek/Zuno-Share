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
exports.bookSession = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const zod_1 = require("zod");
const bookSessionSchema = zod_1.z.object({
    mentorId: zod_1.z.string().uuid({ message: "Invalid mentor ID" }),
    learnerId: zod_1.z.string().uuid({ message: "Invalid learner ID" }),
    skillId: zod_1.z.string().uuid({ message: "Invalid skill ID" }),
    scheduledAt: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format for scheduledAt",
    }),
});
const bookSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = bookSessionSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            message: "Validation error",
            errors: parsed.error.format(),
        });
        return;
    }
    const { mentorId, learnerId, skillId, scheduledAt } = parsed.data;
    try {
        const session = yield prisma_1.default.session.create({
            data: {
                mentorId,
                learnerId,
                skillId,
                scheduledAt: new Date(scheduledAt),
            },
        });
        res.status(200).json(session);
        return;
    }
    catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ message: "Failed to create session" });
        return;
    }
});
exports.bookSession = bookSession;
