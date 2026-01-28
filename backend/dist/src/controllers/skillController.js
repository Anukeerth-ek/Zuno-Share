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
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSkills = exports.addSkill = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// Zod schema for validation
const skillSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Skill name must be at least 2 characters"),
});
// POST /api/skills - Add new skill
const addSkill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = skillSchema.safeParse(req.body);
    if (!validation.success) {
        res.status(400).json({ error: validation.error.errors });
        return;
    }
    const { name } = validation.data;
    try {
        const existingSkill = yield prisma.skill.findFirst({ where: { name } });
        if (existingSkill) {
            res.status(409).json({ message: "Skill already exists" });
            return;
        }
        const newSkill = yield prisma.skill.create({ data: { name } });
        res.status(201).json(newSkill);
        return;
    }
    catch (error) {
        console.error("Error adding skill:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.addSkill = addSkill;
// GET /api/skills - List all skills
const listSkills = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skills = yield prisma.skill.findMany();
        res.status(200).json(skills);
        return;
    }
    catch (error) {
        console.error("Error fetching skills:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.listSkills = listSkills;
