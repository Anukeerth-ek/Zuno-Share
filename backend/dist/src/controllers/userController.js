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
exports.getUserById = exports.getUserProfile = exports.createUserProfile = exports.updateSessionStatus = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const statusSchema = zod_1.z.object({
    status: zod_1.z.enum(["ACCEPTED", "REJECTED", "COMPLETED"]),
});
const profileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    bio: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().url().optional(),
    timeZone: zod_1.z.string().optional(),
    skillsOffered: zod_1.z.array(zod_1.z.string()).optional(),
    skillsWanted: zod_1.z.array(zod_1.z.string()).optional(),
    professionTitle: zod_1.z.string().optional(),
    organization: zod_1.z.string().optional(),
    experienceYears: zod_1.z.string().optional(), // keep as string since coming from req.body
    experienceDescription: zod_1.z.string().optional(),
    currentStatus: zod_1.z.string().optional(),
    linkedin: zod_1.z.string().url().optional(),
    github: zod_1.z.string().url().optional(),
    twitter: zod_1.z.string().url().optional(),
    website: zod_1.z.string().url().optional(),
});
const updateSessionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const mentorId = req.userId;
    const { id } = req.params;
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid status",
            errors: parsed.error.format(),
        });
        return;
    }
    const { status } = parsed.data;
    try {
        const session = yield prisma_1.default.session.findFirst({
            where: { id, mentorId },
        });
        if (!session) {
            res.status(404).json({
                message: "Session not found or unauthorized",
            });
            return;
        }
        const updatedSession = yield prisma_1.default.session.update({
            where: { id },
            data: { status: status }, // Cast to 'any' or 'SessionStatus' if imported
        });
        res.status(200).json({ session: updatedSession });
        return;
    }
    catch (error) {
        console.error("Error updating session:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
});
exports.updateSessionStatus = updateSessionStatus;
const createUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const { name, bio, timeZone, professionTitle, organization, experienceYears, experienceDescription, currentStatus, linkedin, github, twitter, website, } = req.body;
        const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        const rawSkillsOffered = req.body.skillsOffered || req.body["skillsOffered[]"] || [];
        const rawSkillsWanted = req.body.skillsWanted || req.body["skillsWanted[]"] || [];
        const skillsOffered = Array.isArray(rawSkillsOffered)
            ? rawSkillsOffered.map((s) => s.trim().toLowerCase())
            : [];
        const skillsWanted = Array.isArray(rawSkillsWanted)
            ? rawSkillsWanted.map((s) => s.trim().toLowerCase())
            : [];
        // Disconnect existing skills
        yield prisma_1.default.user.update({
            where: { id: userId },
            data: {
                skillsOffered: { set: [] },
                skillsWanted: { set: [] },
            },
        });
        const updateData = {
            name,
            bio,
            avatarUrl,
            timeZone,
            skillsOffered: {
                connectOrCreate: skillsOffered.map((name) => ({
                    where: { name },
                    create: { name },
                })),
            },
            skillsWanted: {
                connectOrCreate: skillsWanted.map((name) => ({
                    where: { name },
                    create: { name },
                })),
            },
        };
        if (professionTitle) {
            updateData.professionDetails = {
                upsert: {
                    update: { title: professionTitle },
                    create: { title: professionTitle },
                },
            };
        }
        if (organization) {
            updateData.currentOrganization = {
                upsert: {
                    update: { organization },
                    create: { organization },
                },
            };
        }
        if (experienceYears) {
            updateData.experienceSummary = {
                upsert: {
                    update: {
                        years: Number(experienceYears),
                        description: experienceDescription || "",
                    },
                    create: {
                        years: Number(experienceYears),
                        description: experienceDescription || "",
                    },
                },
            };
        }
        if (currentStatus) {
            updateData.currentStatus = {
                upsert: {
                    update: { status: currentStatus },
                    create: { status: currentStatus },
                },
            };
        }
        if (linkedin || github || twitter || website) {
            updateData.socialLinks = {
                upsert: {
                    update: { linkedin, github, twitter, website },
                    create: { linkedin, github, twitter, website },
                },
            };
        }
        const updatedUser = yield prisma_1.default.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                skillsOffered: true,
                skillsWanted: true,
                professionDetails: true,
                currentOrganization: true,
                experienceSummary: true,
                currentStatus: true,
                socialLinks: true,
            },
        });
        res.status(200).json({ user: updatedUser });
    }
    catch (error) {
        console.error("Error creating profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.createUserProfile = createUserProfile;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: req.userId },
            include: {
                skillsOffered: true,
                skillsWanted: true,
                professionDetails: true,
                currentOrganization: true,
                experienceSummary: true,
                currentStatus: true,
                socialLinks: true,
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getUserProfile = getUserProfile;
// controllers/userController.ts
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { id },
            include: {
                skillsOffered: true,
                skillsWanted: true,
                professionDetails: true,
                currentOrganization: true,
                experienceSummary: true,
                currentStatus: true,
                socialLinks: true,
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getUserById = getUserById;
