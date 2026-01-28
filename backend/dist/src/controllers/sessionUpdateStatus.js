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
exports.updateSessionStatus = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const statusSchema = zod_1.z.object({
    status: zod_1.z.enum(["ACCEPTED", "REJECTED", "COMPLETED"]),
});
const updateSessionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const mentorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: "Invalid status", errors: parsed.error.format() });
        return;
    }
    const { status } = parsed.data;
    const session = yield prisma_1.default.session.findFirst({
        where: { id, mentorId },
    });
    if (!session) {
        res.status(404).json({ message: "Session not found or unauthorized" });
        return;
    }
    const updatedSession = yield prisma_1.default.session.update({
        where: { id },
        data: {
            status: { set: status },
        },
    });
    res.status(200).json({ session: updatedSession });
});
exports.updateSessionStatus = updateSessionStatus;
