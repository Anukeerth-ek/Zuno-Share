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
exports.getAllProfiles = exports.updateUserProfile = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bio, avatarUrl, timeZone, skillsOffered = [], skillsWanted = [], professionTitle, organization, experienceYears, experienceDescription, currentStatus, linkedin, github, twitter, website, } = req.body;
    if (!req.userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        // 1. Upsert skills (gracefully handle empty arrays)
        const offeredSkillRecords = yield Promise.all((skillsOffered || []).map((name) => getOrCreateSkill(name)));
        const wantedSkillRecords = yield Promise.all((skillsWanted || []).map((name) => getOrCreateSkill(name)));
        // 2. Prepare nested updates conditionally
        const data = {
            bio,
            avatarUrl,
            timeZone,
            skillsOffered: {
                set: [],
                connect: offeredSkillRecords.map((skill) => ({ id: skill.id })),
            },
            skillsWanted: {
                set: [],
                connect: wantedSkillRecords.map((skill) => ({ id: skill.id })),
            },
        };
        if (professionTitle) {
            data.professionDetails = {
                upsert: {
                    update: { title: professionTitle },
                    create: { title: professionTitle },
                },
            };
        }
        if (organization) {
            data.currentOrganization = {
                upsert: {
                    update: { organization },
                    create: { organization },
                },
            };
        }
        if (experienceYears || experienceDescription) {
            data.experienceSummary = {
                upsert: {
                    update: {
                        years: Number(experienceYears) || 0,
                        description: experienceDescription || '',
                    },
                    create: {
                        years: Number(experienceYears) || 0,
                        description: experienceDescription || '',
                    },
                },
            };
        }
        if (currentStatus) {
            data.currentStatus = {
                upsert: {
                    update: { status: currentStatus },
                    create: { status: currentStatus },
                },
            };
        }
        if (linkedin || github || twitter || website) {
            data.socialLinks = {
                upsert: {
                    update: {
                        linkedin: linkedin || '',
                        github: github || '',
                        twitter: twitter || '',
                        website: website || '',
                    },
                    create: {
                        linkedin: linkedin || '',
                        github: github || '',
                        twitter: twitter || '',
                        website: website || '',
                    },
                },
            };
        }
        // 3. Update the user
        const updatedUser = yield prisma_1.default.user.update({
            where: { id: req.userId },
            data,
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
        res.status(200).json({ message: "Profile updated", user: updatedUser });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating profile" });
    }
});
exports.updateUserProfile = updateUserProfile;
function getOrCreateSkill(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma_1.default.skill.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    });
}
const getAllProfiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let currentUserId = null;
        const authHeader = req.headers.authorization;
        const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                currentUserId = decoded.userId;
            }
            catch (_a) {
                console.log("Invalid token");
            }
        }
        const users = yield prisma_1.default.user.findMany({
            where: currentUserId ? { id: { not: currentUserId } } : {},
            include: {
                skillsOffered: true,
                professionDetails: true,
                currentOrganization: true,
                experienceSummary: true,
                currentStatus: true,
                socialLinks: true,
                receivedConnections: {
                    select: {
                        id: true,
                        senderId: true,
                    },
                },
                sentConnections: {
                    select: {
                        id: true,
                        receiverId: true,
                    },
                },
            },
        });
        res.json({ users });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getAllProfiles = getAllProfiles;
